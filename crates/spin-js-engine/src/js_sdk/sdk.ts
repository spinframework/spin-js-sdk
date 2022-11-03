/** @internal */
require('fast-text-encoding')

/** @internal */
import { fetch } from "./modules/spinSdk"
import { HttpRequest, HttpResponse, HandleRequest } from "./modules/spinSdk"

/** @internal */
import {fsPromises} from "./modules/fsPromises"
import "./modules/fsPromises"

/** @internal */
import {atob, btoa, Buffer} from "./modules/stringHandling"

import { URL } from "./modules/url"

/** @internal */
export { atob, btoa, Buffer, fetch, fsPromises}

// Stuff to be exported to the sdk types file
export { HttpRequest, HttpResponse, HandleRequest, URL }
