const onDeleteProduct = (csrfToken, productId, btn) => {

    const productElement = btn.closest("article");
    fetch(`/admin/product/${productId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "csrf-token": `${csrfToken}`,
        }
    }).then((result) => {
        return result.json();
    }).then((data) => {
        console.log("data: \n", data);
        productElement.parentNode.removeChild(productElement);
    }).catch((err) => {
        console.error("error in fetch: \n", err);
    });

}