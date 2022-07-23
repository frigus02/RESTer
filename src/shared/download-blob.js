export function downloadBlob(blob, downloadOptions) {
    const url = URL.createObjectURL(blob);
    chrome.downloads.download(
        {
            ...downloadOptions,
            url,
        },
        (id) => {
            if (!id) return;
            function onChanged(downloadDelta) {
                if (downloadDelta.id !== id) return;
                if (downloadDelta.state === 'in_progress') return;
                URL.revokeObjectURL(url);
                chrome.downloads.onChanged.removeListener(onChanged);
            }
            chrome.downloads.onChanged.addListener(onChanged);
        }
    );
}
