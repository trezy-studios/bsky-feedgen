/**
 * Generates a message for unrecognised namespaces.
 *
 * @param {string} namespace The unrecognised namespace.
 * @returns {string} The compiled error message.
 */
export function UNRECOGNISED_NAMESPACE(namespace) {
	return `Unrecognised namespace: ${namespace}`
}

/**
 * Generates a message for unimplemented namespaces.
 *
 * @param {string} namespace The unrecognised namespace.
 * @returns {string} The compiled error message.
 */
export function UNIMPLEMENTED_NAMESPACE(namespace) {
	return `Namespace not yet implemented: ${namespace}`
}

/**
 * Generates a message for unimplemented methods.
 *
 * @param {string} method The name of the method.
 * @returns {string} The compiled error message.
 */
export function UNIMPLEMENTED_METHOD(method) {
	return `Method not yet implemented: ${method}`
}
