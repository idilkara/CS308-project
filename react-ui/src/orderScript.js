function showOrders(status) {
    const orders = document.querySelectorAll('.order');
    orders.forEach(order => {
        if (status === 'all' || order.dataset.status === status) {
            order.style.display = 'flex';
        } else {
            order.style.display = 'none';
        }
    });

    document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}
