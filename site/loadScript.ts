export async function loadScript(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.setAttribute("src", src);
		script.defer = true;
		script.onload = () => {
			resolve();
		};
		script.onerror = () => {
			reject(new Error(`Failed to load script ${src}`));
		};
		document.head.appendChild(script);
	});
}