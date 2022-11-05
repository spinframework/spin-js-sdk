/** @internal */
require('fast-text-encoding')

/** @internal */
import { fetch } from "./modules/spinSdk"
import { HttpRequest, HttpResponse, HandleRequest } from "./modules/spinSdk"

/** @internal */
import {fsPromises} from "./modules/fsPromises"
import "./modules/fsPromises"

/** @internal */
import {glob} from "./modules/glob"
import "./modules/glob"

/** @internal */
import {atob, btoa, Buffer} from "./modules/stringHandling"

import { URL } from "./modules/url"

/** @internal */
export { atob, btoa, Buffer, fetch, fsPromises, glob}

// Stuff to be exported to the sdk types file
export { HttpRequest, HttpResponse, HandleRequest, URL }
