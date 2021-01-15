(() => {
    const uploadInput = document.getElementById("upload");
    const licenseUrl = uploadInput.getAttribute('data-license-url');

    uploadInput.addEventListener("change", () => {

        const formData = new FormData();
        formData.append("license", uploadInput.files[0]);

        fetch(licenseUrl, {
            body: formData,
            "Content-type": "multipart/form-data",
            method: "POST",
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);

                if (data.licenseValid) {
                    location.reload();
                }
            });
    });

})();
