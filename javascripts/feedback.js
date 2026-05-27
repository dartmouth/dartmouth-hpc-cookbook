document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(
        '.md-feedback__note a[href*="docs.google.com/forms"]'
    );
    links.forEach(link => {
        const url = new URL(link.href);
        url.searchParams.set("usp", "pp_url");
        url.searchParams.set("entry.421022704", window.location.href);
        link.href = url.toString();
    });
});
