# Self Hosted Cloudflare Editor

Open source project designed to have easier/quicker access to the Cloudflare API.
Useful for creating a managed customer access to their domain, should they need to.

## Useful Information

I used Nuxt 3's server structure to have the requests be run from the backend, in order to avoid CORS and other issues when sending traffic between sites.
With the code being open-source you can see where the requests go, but would recommend you self-host it anyway. [Demo](https://dns.brth.uk)
The site uses local storage to keep majority of the information in the browser, this may not be everyones preffered method, but it works.

The project uses Nuxt UI, so to quickly and easily adjust the theming, use [app.config.js](https://github.com/Hybes/cf-editor-page/blob/main/app.config.js) and [tailwind.config.js](https://github.com/Hybes/cf-editor-page/blob/main/tailwind.config.js)

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build
```

Run on production:

```bash
# npm
npm run start
```

### Contributing

Feel free to contribute, PR's will need to be approved to maintain the safety of the project.

#### Links

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.
