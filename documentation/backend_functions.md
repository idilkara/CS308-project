
## TO DO (NOT PROGRESS DEMO):

[ ] Sales manager calculate revenue and loss/profit in between given dates and view a chart of it. (For loss and profit calculations,the product cost can default to 50% of the sale price for convenience)

[ ] refund routes (see notes from pdf)
    customer:
        request refund by order id and product id

    sales manager:
        accept refund
        reject refund


## ADITIONAL NOETS FROM THE PDF
REFUND (TEST): A customer shall also be able to selectively return a product and ask for a refund. In
such a case, the customer will select an already purchased product from his/her order
history within 30 days of purchase, provided the product has been delivered. The sales
manager will evaluate the refund request and upon receiving the product back to the
store will authorize the refund. If a refund is approved, the product will be added back to
stock, and the customer must be notified—ideally via email—of the approval and
refunded amount. Moreover, if the product was bought during a discount campaign and
the customer chooses to return the product after the campaign ends, the refunded
amount will be the same as the time of its purchase with the discount applied. 

 product order bilgisinde set edilen pricelar discount edilmiş halleri. geçmiş discount kontrolu gerekmiyor.





## TESTED - DONE:
INVOICE THINGS

INVOICE viewing pdf download etc

Send PDF

comment to a product
rate a product

customer: -profile page

product manager: 
approve of a comment to product

sales manager:
update price of a product

view orders list given user id
add product

present products

add item to shopping cart given product id
remove item from shopping cart given product id
view shopping cart
clear shopping cart

purchase the items in the shopping cart:
    turn items in the cart to an order list - add stock check and stock decrease


change order delivery status - resolved
view order status 
list all deliveries and ability to change the status

product manager - delivery department: 
remove product
add product category
update stock given product id

GET methods for the customer:
present products given categories
present product information given product id
present categories

REVIEW: product manager match
REVIEW: remove function


Sales Manager sets discount
Discount notification to user

Sales manager view invoice pdf
Product manager shall view invoices
