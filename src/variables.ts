//@ts-ignore
import { get as spinGet } from "fermyon:spin/variables@2.0.0"

export function get(key: string): string | null {
    try {
        return spinGet(key)
    } catch (e) {
        return null
    }
}
