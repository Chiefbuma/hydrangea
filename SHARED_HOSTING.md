# Shared Hosting Deployment

This app is prepared to run on Node.js shared hosting with Phusion Passenger using `server.js` as the startup file.

## Hosting Settings

- Application root: `domains/radiant.gle360dcapital.africa`
- Application startup file: `server.js`
- Application mode: `production`
- Node.js version: `18.18+` or newer
- Passenger log file: `/home/gledcapi/logs/passenger.log`

## Required Steps

1. Upload the project into `domains/radiant.gle360dcapital.africa`.
2. In the Node.js app panel, run `NPM Install`.
3. Run the build step:
   - `npm run build`
4. Start or restart the Node.js app.

## Environment Variables

Set these values in the hosting panel:

- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_USER=gledcapi_radiant`
- `DB_PASSWORD=<your database password>`
- `DB_DATABASE=gledcapi_radiant`
- `SESSION_SECRET=<a long random secret>`
- `NEXT_PUBLIC_API_URL=https://radiant.gle360dcapital.africa/api`

## Notes

- `SESSION_SECRET` is required in production.
- The app uses Next.js standalone output, so `npm run build` must complete before Passenger can start the app.
- If the app does not start, check `/home/gledcapi/logs/passenger.log`.
