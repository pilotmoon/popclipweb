
// get params from url
export function readParams() {
    return new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
}