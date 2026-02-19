'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Transaction, Ambulance, AdminDashboardData, AmbulancePerformanceData } from '@/lib/types';
import { getTransactions, getAmbulances } from '@/services/api-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Loader2, Download } from 'lucide-react';
import { format, startOfMonth, isWithinInterval, startOfDay, endOfDay, subMonths } from 'date-fns';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RadialBar, RadialBarChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportSummaryToExcel, exportDetailedToExcel } from '@/lib/excel-export';

const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

export default function AdminDashboardClient() {
    const [transactions, setTransactions] = useState<Transaction[] | null>(null);
    const [ambulances, setAmbulances] = useState<Ambulance[] | null>(null);

    const today = useMemo(() => new Date(), []);
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: startOfMonth(today),
        to: today,
    });
    
    const [tempStartDate, setTempStartDate] = useState<Date>(dateRange.from);
    const [tempEndDate, setTempEndDate] = useState<Date>(dateRange.to);

    const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
    const [previousMonthData, setPreviousMonthData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [transactionsData, ambulancesData] = await Promise.all([
                getTransactions(),
                getAmbulances(),
                ]);
                setTransactions(transactionsData);
                setAmbulances(ambulancesData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
                setTransactions([]);
                setAmbulances([]);
            }
        }
        fetchData();
    }, []);

    const currentMonthRange = useMemo(() => {
        return {
            from: startOfMonth(today),
            to: today,
        };
    }, [today]);
    
    const previousMonthRange = useMemo(() => {
        const previousMonth = subMonths(today, 1);
        const dayOfMonth = today.getDate();
        const daysInPreviousMonth = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();
        
        return {
            from: startOfMonth(previousMonth),
            to: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), Math.min(dayOfMonth, daysInPreviousMonth)),
        };
    }, [today]);

    const calculateDashboardData = useMemo(() => {
        return (transactions: Transaction[], ambulances: Ambulance[], range: { from: Date, to: Date }): AdminDashboardData => {
            const filteredTransactions = transactions.filter(t => {
                try {
                    const txDate = typeof t.date === 'string' ? new Date(t.date) : t.date;
                    return isWithinInterval(txDate, { start: startOfDay(range.from), end: endOfDay(range.to) });
                } catch (e) {
                    return false;
                }
            });
            
            const summary = filteredTransactions.reduce((acc, t) => {
                acc.total_target += t.target || 0;
                acc.total_net_banked += t.net_banked || 0;
                acc.total_till += t.total_till || 0;
                acc.total_deficit += t.deficit || 0;
                acc.total_cash_deposited += t.cash_deposited_by_staff || 0;
                return acc;
            }, { total_target: 0, total_net_banked: 0, total_till: 0, total_deficit: 0, total_cash_deposited: 0 });

            const overall_performance = summary.total_target > 0 ? Math.min(100, (summary.total_net_banked / summary.total_target) * 100) : 0;
            
            const ambulancePerformanceMap = new Map<number, { trans: Transaction[], count: number }>();
            filteredTransactions.forEach(t => {
                if (!ambulancePerformanceMap.has(t.ambulance.id)) {
                    ambulancePerformanceMap.set(t.ambulance.id, { trans: [], count: 0 });
                }
                const entry = ambulancePerformanceMap.get(t.ambulance.id)!;
                entry.trans.push(t);
                entry.count++;
            });

            const ambulance_performance: AmbulancePerformanceData[] = Array.from(ambulancePerformanceMap.entries()).map(([ambulanceId, data]) => {
                const ambulance = ambulances.find(a => a.id === ambulanceId);
                const totals = data.trans.reduce((acc, t) => {
                    acc.total_target += t.target || 0;
                    acc.total_net_banked += t.net_banked || 0;
                    acc.total_till += t.total_till || 0;
                    acc.total_cash_deposited += t.cash_deposited_by_staff || 0;
                    return acc;
                }, { total_target: 0, total_net_banked: 0, total_till: 0, total_cash_deposited: 0 });

                const total_deficit = totals.total_target - totals.total_net_banked;
                const performance = totals.total_target > 0 ? (totals.total_net_banked / totals.total_target) : 0;

                return {
                    ambulanceId,
                    reg_no: ambulance?.reg_no ?? `Unknown (${ambulanceId})`,
                    total_target: totals.total_target,
                    total_net_banked: totals.total_net_banked,
                    total_till: totals.total_till,
                    total_cash_deposited: totals.total_cash_deposited,
                    total_deficit,
                    performance,
                };
            }).sort((a, b) => b.total_net_banked - a.total_net_banked);

            return {
                ...summary,
                overall_performance,
                ambulance_performance,
            };
        };
    }, []);
    
    const filteredDashboardData = useMemo(() => {
        if (!transactions || !ambulances) return null;
        return calculateDashboardData(transactions, ambulances, dateRange);
    }, [transactions, ambulances, dateRange, calculateDashboardData]);

    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        return transactions.filter(t => {
            try {
                const txDate = typeof t.date === 'string' ? new Date(t.date) : t.date;
                return isWithinInterval(txDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
            } catch (e) {
                return false;
            }
        });
    }, [transactions, dateRange]);

    useEffect(() => {
        if (!transactions || !ambulances) return;

        setLoading(true);
        const currentData = calculateDashboardData(transactions, ambulances, currentMonthRange);
        const previousData = calculateDashboardData(transactions, ambulances, previousMonthRange);
        setDashboardData(currentData);
        setPreviousMonthData(previousData);
        setLoading(false);
    }, [transactions, ambulances, calculateDashboardData, currentMonthRange, previousMonthRange]);

    const handleStartDateChange = (date: Date | undefined) => {
        if (date) {
            setTempStartDate(date);
        }
    }
    
    const handleEndDateChange = (date: Date | undefined) => {
        if (date) {
            setTempEndDate(date);
        }
    }
    
    const handleApplyStartDate = () => {
        setDateRange(prev => ({ ...prev, from: tempStartDate }));
    }
    
    const handleApplyEndDate = () => {
        setDateRange(prev => ({ ...prev, to: tempEndDate }));
    }
    
    if (loading || !dashboardData || !filteredDashboardData) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">High-level overview of fleet performance.</p>
                </div>
                <div className="flex items-end gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="start-date"
                                    variant={"outline"}
                                    className={cn("w-[180px] justify-start text-left font-normal")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.from ? format(dateRange.from, "LLL dd, y") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <div className="p-3 space-y-2">
                                    <ReactCalendar
                                        onChange={(date) => handleStartDateChange(date as Date)}
                                        value={tempStartDate}
                                        maxDate={tempEndDate}
                                        className="text-xs border-none"
                                    />
                                    <Button onClick={handleApplyStartDate} className="w-full text-xs h-8">Set Start Date</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="end-date"
                                    variant={"outline"}
                                    className={cn("w-[180px] justify-start text-left font-normal")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.to ? format(dateRange.to, "LLL dd, y") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <div className="p-3 space-y-2">
                                    <ReactCalendar
                                        onChange={(date) => handleEndDateChange(date as Date)}
                                        value={tempEndDate}
                                        minDate={tempStartDate}
                                        className="text-xs border-none"
                                    />
                                    <Button onClick={handleApplyEndDate} className="w-full text-xs h-8">Set End Date</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Overall Performance</CardTitle>
                            <CardDescription>
                                Net Banked vs Target for {format(dateRange.from, "LLL d")} - {format(dateRange.to, "LLL d, y")}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <ChartContainer
                                config={{ performance: { label: "Performance", color: "hsl(var(--primary))" } }}
                                className="mx-auto aspect-square h-[250px]"
                            >
                                <RadialBarChart
                                    data={[{ name: "performance", value: filteredDashboardData.overall_performance }]}
                                    startAngle={-140}
                                    endAngle={130}
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    barSize={20}
                                >
                                    <RadialBar
                                        dataKey="value"
                                        background
                                        cornerRadius={10}
                                        className="fill-primary"
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                hideLabel
                                                formatter={(value) => `${Number(value).toFixed(0)}%`}
                                            />
                                        }
                                    />
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-4xl font-bold">
                                        {(filteredDashboardData.overall_performance).toFixed(0)}%
                                    </text>
                                    <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm">
                                        Performance
                                    </text>
                                </RadialBarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Key Metrics Comparison</CardTitle>
                            <CardDescription>
                                {format(currentMonthRange.from, "MMM")}({format(currentMonthRange.from, "d")}-{format(currentMonthRange.to, "d")}) vs {format(previousMonthRange.from, "MMM")}({format(previousMonthRange.from, "d")}-{format(previousMonthRange.to, "d")})
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Metric</TableHead>
                                        <TableHead className="text-right">{format(currentMonthRange.from, "MMM")}({format(currentMonthRange.from, "d")}-{format(currentMonthRange.to, "d")})</TableHead>
                                        <TableHead className="text-right">{format(previousMonthRange.from, "MMM")}({format(previousMonthRange.from, "d")}-{format(previousMonthRange.to, "d")})</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Cash Deposited</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(dashboardData.total_cash_deposited)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(previousMonthData?.total_cash_deposited)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Total Till</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(dashboardData.total_till)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(previousMonthData?.total_till)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Net Banked</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(dashboardData.total_net_banked)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(previousMonthData?.total_net_banked)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Deficit</TableCell>
                                        <TableCell className="text-right text-red-500 font-semibold">{formatCurrency(dashboardData.total_deficit)}</TableCell>
                                        <TableCell className="text-right text-red-500 font-semibold">{formatCurrency(previousMonthData?.total_deficit)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

            {filteredDashboardData && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Ambulance Performance Analysis</CardTitle>
                                <CardDescription>
                                    Period: {format(dateRange.from, "MMMM d, yyyy")} - {format(dateRange.to, "MMMM d, yyyy")}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        const periodLabel = `${format(dateRange.from, "MMMM d, yyyy")} - ${format(dateRange.to, "MMMM d, yyyy")}`;
                                        exportDetailedToExcel(filteredTransactions, periodLabel);
                                    }}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Details
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        const periodLabel = `${format(dateRange.from, "MMMM d, yyyy")} - ${format(dateRange.to, "MMMM d, yyyy")}`;
                                        exportSummaryToExcel(filteredDashboardData.ambulance_performance, periodLabel);
                                    }}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Summary
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={filteredDashboardData.ambulance_performance.map((item, index) => ({ ...item, id: index }))} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
