# API Request Builder
Simple request builder on top of Axios that allows pre-configured options, query params parser and errors to text with a Lang option

# Todo list
- ⏳ Full docs
- ⏳ Tests and examples
- ⏳ Cancel/Abort request

# Installation
You can install using [npm](https://www.npmjs.com/package/api-request-builder):

``` bash
npm install api-request-builder
```

# Usage
``` javascript
// Load the module
const apiRequestBuilder = require('api-request-builder')

// Default params for all requests
const DEFAULT_PARAMS = {
  server: "/api",   // Self domain requests to '/api' path
  timeout: 5000    // 10s timeout
}

// Initialize
const api = apiRequestBuilder( DEFAULT_PARMS )

/**
 * Your code ♥
 */
```

## Params
This library allows you to set a default set of params for all the request.

#### Config params
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| validMethods | Array \<String> | `["GET","POST","PUT","DELETE"]` | Allowed HTTP Methods |
| lang | Object | [LANG](lang.json) | Lang configuration |
| tokenAsParam | Boolean | `false` | Append token (if exist) in the query params |
| translateErrors | Boolean | `true` | Parse request errors objects and return strings based in the lang param |

#### Request params
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| server | String | `"http://localhost"` | API Server |
| endpoint | String |  | Request Enpoint path (relative to server) |
| path | String |  | Request URI path (relative to server/endpoint) |
| vars | Object | `{}` | URI path variables values |
| params | Object | `{}` | Query params |
| mime | String | `"application/json"` | Request `Content-Type` header |
| headers | Object | `{}` | Request headers |
| token | String | | Request Auth token |
| timeout | Number | `50000` | Request timeout in miliseconds |
