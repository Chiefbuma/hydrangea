
import BorrowerDetailsClient from './details-client';

export default function BorrowerPage({ params }: { params: { id: string } }) {
  return <BorrowerDetailsClient id={params.id} />;
}
