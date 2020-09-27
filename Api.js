// Configs
const VALID_HTTP_METHODS = ['GET','POST','PUT','DELETE']
const LANG = require('./lang.json')

// Modules
const QueryString = require('query-string')
const merge = require('deepmerge')
const axios = require('axios')

/**
 * @class ApiRequestBuilder
 * 
 * @todo 
 */
class ApiRequestBuilder {
    constructor(params = {}){
        // Configurations
        this.validMethods = params.validMethods || VALID_HTTP_METHODS
        this.lang = {...LANG, ...params.lang || {}}
        this.tokenAsParam = params.tokenAsParam
        this.translateErrors = typeof params.translateErrors == "undefined" ? true : params.translateErrors

        // Defaults
        this.server = params.server || 'http://localhost'
        
        this.endpoint = params.endpoint
        this.path = params.path
        this.vars = params.vars // Path variables
        this.params = params.params
        this.mime = params.mime || "application/json"
        this.headers = params.headers || {}

        this.token = params.token

        this.timeout = params.timeout || 50000

        // Requests stack
        this.requests = {}
    }
    /**
     * Build url
     * 
     * @todo Sanitize vars
     * 
     * @param {object} buildParams
     * @param {string|InstanceDefault|'http://localhost'} buildParams.server API Server url with protocol 
     * @param {string|InstanceDefault|''} buildParams.endpoint API Endpoint 
     * @param {string|InstanceDefault|''} buildParams.path Request path
     * @param {object|{}} buildParams.vars Path variables
     * @param {object|{}} buildParams.params Request query parameters
     * @param {string|InstanceDefault|undefined} buildParams.token Request auth token
     * @param {string|InstanceDefault|false} buildParams.tokenAsParam Auth token name as param
     * 
     * @returns {string} Full request URL
     */
    buildURL(buildParams = {}){
        const {
            server = this.server,
            endpoint = this.endpoint,
            token = this.token,
            tokenAsParam = this.tokenAsParam,
        } = buildParams
        let { path = this.path, vars = {}, params = {} } = buildParams

        // Base URL
        let url = `${server}${endpoint ? `/${endpoint}` : ''}`
        // Path
        if(path) {
            // Merge vars if has default
            vars = (typeof this.vars == "object") ? merge(this.vars, vars) : vars
            // Replace path vars
            Object.keys(vars).map( key => {
                path = path.replace(`{${key}}`, vars[key])
            })
            // Append path to url
            url += `/${path}`
        }
        // Merge params if has default
        params = (typeof this.params == "object") ? merge(this.params, params) : params
        // Token as param?
        if(tokenAsParam) params[tokenAsParam] = token
        // Stringify params and append to url if has elements
        if(Object.keys(params).length) url += `?${QueryString.stringify( params )}`
        // All done!
        return url
    }
    get(data = {}){
        data.method = 'GET'
        return this.httpRequest(data)
    }
    post(data = {}){
        data.method = 'POST'
        return this.httpRequest(data)
    }
    put(data = {}){
        data.method = 'PUT'
        return this.httpRequest(data)
    }
    delete(data = {}){
        data.method = 'DELETE'
        return this.httpRequest(data)
    }
    /**
     * 
     * @param {object} requestData 
     * 
     * @param {string|'GET'} requestData.method
     * 
     * @param {string|InstanceDefault|'http://localhost'} requestData.server API Server url with protocol 
     * @param {string|InstanceDefault|''} requestData.endpoint API Endpoint 
     * @param {string|InstanceDefault|''} requestData.path Request path
     * @param {object|{}} requestData.vars Path variables
     * @param {object|{}} requestData.params Request query parameters
     * 
     * @param {string|InstanceDefault|'application/json'} requestData.mime Request mime (content-type)
     * @param {object|{}} requestData.headers Request headers
     * 
     * @param {string|InstanceDefault|undefined} requestData.auth Request auth token
     * @param {string|InstanceDefault|false} requestData.tokenAsParam Auth token name as param
     */
    httpRequest(requestData = {}){
        // Consts that MUST exist in spread
        const {tokenAsParam = this.tokenAsParam } = requestData
        // Consts spread
        const {
            // URL Params
            server, endpoint, path = '', vars, params,
            // Auth params
            auth = this.token && !tokenAsParam ? this.token : undefined,
            // Header params
            mime = this.mime,
            // Config params
            lang , translateErrors = this.translateErrors, timeout = this.timeout } = requestData
        // Variables spread
        let { method = 'GET', data = {}, headers = {} } = requestData

        // Promise
        return new Promise((resolve, reject) => {
            let url
            // Create URL
            try {
                url = this.buildURL({
                    server,
                    endpoint,
                    path,
                    vars,
                    params,
                    token: tokenAsParam ? token : undefined,
                    tokenAsParam
                })
            } catch (err) {
                // Error building URL
                return reject(err)
            }
            // Validate method
            method = method.toUpperCase()
            if(!this.validMethods.includes(method)) return reject( "METHOD_NOT_ALLOWED" )
            // Remove data in GET && DELETE methods
            if(method == "GET" || method == "DELETE"){
                data = undefined
            }

            // Merge headers if has default
            headers = (typeof this.headers == "object") ? merge(this.headers, headers) : headers

            // Set headers
            if(auth) headers['Authorization'] = 'Bearer ' + auth

            // HTTP Query
            axios({
                    url,
                    method,
                    data,
                    contentType: (typeof data == 'object') ? `${mime}; charset=utf-8` : undefined,
                    dataType: 'json',
                    json: true,
                    headers,
                    timeout: timeout,
                    cache : (method == "GET") ? false : undefined,
                })
                .then(res => resolve(res.data))
                .catch(err => reject(translateErrors ? this.stringifyError(err.response, lang) : err))
        })
    }

    stringifyError(err = {}, lang = this.lang){
        // Spread
        let { status = 500, statusText, data } = err

        // Custom cases
        switch(status){
            case 0:
                switch(statusText){
                    case 'timeout':
                        status = "TIMEOUT"
                        statusText = "Connection timed out"
                        break
                    case 'error':
                        status = "ERROR"
                        statusText = "Connection error"
                        break
                    }
                break
        }
        // Return - langed status code || Default status text || Raw data
        return lang[status] || statusText || data
    }
}

// Exports
module.exports = params => new ApiRequestBuilder(params)
module.exports.Class = ApiRequestBuilder

module.exports.VALID_HTTP_METHODS
module.exports.LANG

// JSDocs

/**
 * Default value defined in the constructor
 * @typedef {*} InstanceDefault
 */