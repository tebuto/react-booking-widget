
<div align="center">
  <img alt="Tebuto" src="https://tebuto.de/assets/logo.svg" width="400" />
</div>

<p align="center">A <a href="https://react.dev" target="_blank">React</a> component for integrating the <a href="https://tebuto.de"  target="_blank">Tebuto</a> booking widget into your own website.
<p align="center">

<div align="center">
  <a href="https://www.npmjs.com/package/jest"><img alt="NPM Version" src="https://img.shields.io/npm/v/%40tebuto%2Freact-booking-widget"></a>
  <a href="https://github.com/tebuto/react-gdpr-cookie-consent/blob/main/LICENSE"> <img alt="@tebuto/react-booking-widget is released under a MIT licence" src="https://img.shields.io/npm/l/%40tebuto%2Freact-booking-widget"></a>
  <a href="https://github.com/tebuto/react-gdpr-cookie-consent/actions/workflows/branch.yaml"><img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/tebuto/react-booking-widget/.github%2Fworkflows%2Fbranch.yaml?label=CI&logo=GitHub"></a>
</div>
<hr />

## Table of Contents <!-- omit in toc -->

- [Installing](#installing)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [License](#license)

## Installing

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/package/@tebuto/react-booking-widget).

Installation is done using the`npm install` command:

``` bash
npm install @tebuto/react-booking-widget
```

## Getting Started

You need an existing react project to use the Tebuto booking component, if you don't have one follow this [Guide](https://react.dev/learn/start-a-new-react-project) to create one.

Here's a basic example how the widget can be used:

```typescript
import { TebutoBookingWidget } from '@tebuto/react-booking-widget'

const YourComponent = () => {
  return <TebutoBookingWidget therapistUUID="<your-therapist-uuid>" />
}
```

You can obtain the therapist UUID from the [appointment settings](https://app.tebuto.de/einstellungen/termine). In the embedding section, click on the HTML button and use the value from the `data-therapist-uuid` attribute.

## API Reference

> **Note**: The values for the therapist UUID and the category IDs can be obtained from the HTML embedding option in the [appointment settings](https://app.tebuto.de/einstellungen/termine).

| Name            | Description                                                     | Type       | Required | Default       |
| --------------- | --------------------------------------------------------------- | ---------- | -------- | ------------- |
| therapistUUID   | A unique identifier for the therapist.                          | `string`   | `Yes`    | -             |
| backgroundColor | The hex background color of the component.                      | `string`   | `No`     | `transparent` |
| border          | Specifies the border style (e.g., `none`, `solid`, `dashed`).   | `boolean`  | `No`     | `true`        |
| categories      | An array of appointment category IDs to be shown in the widget. | `number[]` | `No`     | `[]`          |

## License

[MIT](LICENSE)
