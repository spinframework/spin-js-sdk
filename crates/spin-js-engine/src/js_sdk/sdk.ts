/** @internal */
require('fast-text-encoding')

/** @internal */
import { fetch, spinInternal } from "./modules/spinSdk"
import { Handler, HttpRequest, HttpResponse, HandleRequest } from "./modules/spinSdk"

/** @internal */
import { fsPromises } from "./modules/fsPromises"
import "./modules/fsPromises"

/** @internal */
import { glob } from "./modules/glob"
import "./modules/glob"

/** @internal */
import { atob, btoa, Buffer } from "./modules/stringHandling"

/** @internal */
import { crypto } from "./modules/crypto"

/** @internal */
import "./modules/random"

/** @internal */
import { URL, URLSearchParams } from "./modules/url"
import "./modules/url"

/** @internal */
import { utils } from "./modules/utils"
import "./modules/utils"


/** @internal */
export { atob, btoa, Buffer, fetch, fsPromises, glob, crypto, URL, URLSearchParams, utils, spinInternal }

// Stuff to be exported to the sdk types file
export { Handler, HttpRequest, HttpResponse, HandleRequest }
