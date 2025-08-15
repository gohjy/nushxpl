function notOk(e) {
    document.body.textContent = "Something went wrong.";
    console.error(e);
    return;
}

async function main({$hash=undefined}={$hash:undefined}) {
    document.body.innerHTML = "";

    const hash = ($hash ?? location.hash).toLowerCase().match(/^\#?\/([a-z0-9\-]+)\/(([a-z0-9\-]+)|\~)$/);
    const lib = hash?.[1];
    const path = hash?.[2];

    if (($hash ?? location.hash).match(/^\#?\/?$/)) {
        location.hash = "/nushxpl/about";
        main({$hash: "/nushxpl/about"});
        return;
    }

    if (!hash) {
        if (lib === "nushxpl") {
            return notOk(new Error("bad url"));
        }
        main({$hash: "/nushxpl/error-badurl"});
        return;
    }


    let libResp;
    try {
        libResp = await fetch(`./data/${lib}.json`, {redirect: "error"});
    } catch(e) {
        return notOk(e);
    }

    if (!libResp.ok) {
        if (lib === "nushxpl") {
            return notOk(new Error("fetch status code not ok"));
        }
        main({$hash: "/nushxpl/error-notfound"});
        return;
    }

    let libData;

    try {
        libData = await libResp.json();
    } catch(e) {
        if (lib === "nushxpl") {
            return notOk(new Error("json failed"));
        }
        main({$hash: "/nushxpl/error-baddata"});
        return;
    }

    let thisData = libData[path];
    if (!thisData) {
        if (lib === "nushxpl") {
            return notOk(new Error("specified path not in lib data"));
        }
        main({$hash: "/nushxpl/error-notfound"});
        return;
    }
    if (!thisData.frame) {
        if (lib === "nushxpl") {
            return notOk(new Error("no frame property in libdata"));
        }
        main({$hash: "/nushxpl/error-notfound"});
        return;
    }

    const iframe = document.createElement("iframe");
    iframe.src = thisData.frame;
    document.body.append(iframe);
    document.title = thisData.title ?? thisData.frame;
}

window.addEventListener("hashchange", async () => {
    try {
        await main();
    } catch {
        main({$hash: "/nushxpl/error"});
    }
});

main();