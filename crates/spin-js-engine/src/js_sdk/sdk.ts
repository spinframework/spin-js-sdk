/** @internal */
require('fast-text-encoding')

/** @internal */
import  "./modules/spinSdk"
import { fetch, spinInternal } from "./modules/spinSdk"

/** @internal */
import { fsPromises } from "./modules/fsPromises"

/** @internal */
import { glob } from "./modules/glob"

/** @internal */
import { atob, btoa, Buffer } from "./modules/stringHandling"

/** @internal */
import { crypto } from "./modules/crypto"

/** @internal */
import "./modules/random"

/** @internal */
import { URL, URLSearchParams } from "./modules/url"

import { console } from "./modules/console"

export { atob, btoa, Buffer, fetch, fsPromises, glob, crypto, URL, URLSearchParams, spinInternal, console }

