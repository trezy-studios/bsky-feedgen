/**
 * @component
 * @param {object} config All configuration.
 * @param {import('react').ReactNode} config.children Children to be rendered within this component.
 */
export default function RootLayout(config) {
	const { children } = config

	return (
		<html lang={'en'}>
			<body>{children}</body>
		</html>
	)
}
