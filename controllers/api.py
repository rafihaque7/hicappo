# Here go your api methods.
from datetime import datetime

@auth.requires_signature()
def getGroupNames():
    groupNames = []


    for r in db(db.group_table.who == auth.user.id).select():
        t = dict(
            name = r.name,
            id = r.id,
        )
        groupNames.append(t)
    
    if len(groupNames)==0:
        l = db.group_table.insert(name="all", who=auth.user.id)
        groupNames.append(dict(name="all", id=l))

    
    return response.json(dict(
        groupNames = groupNames
    ))

@auth.requires_signature()
def addGroup():
    db.group_table.insert(name=request.vars.newName, who=auth.user.id)
    return "ok"


@auth.requires_signature()
def addListing():

    theaddress = request.vars.form_address
    theprefname = request.vars.form_prefname
    thegroupid = request.vars.form_group
    thetenantEmail = request.vars.form_tenant_email
    theamount = request.vars.form_amount
    theimage_url = request.vars.form_image_url
    t_id = db.listing.insert(
        address = theaddress,
        pref_name = theprefname,
        group_id = thegroupid,
        amount = theamount,
        image_url = theimage_url,
    )

    s_id = db.templisting.insert(
        tenant_email = thetenantEmail,
        listingid = t_id,
    )


    return response.json(dict(

    ))

@auth.requires_signature()
def change_default():
    # db.user_pref.insert(
    #         who = auth.user.id,
    #         what = request.vars.what,
    # )
    # logger.info(request.vars.what)
    q = db(db.user_pref.who == auth.user.id).select().first()

    logger.info(q.what)
    q.what = request.vars.what
    q.update_record()

    logger.info(q.what)
    return "ok"

@auth.requires_signature()
def getListings():

    listings = []

    for r in db(db.listing.landlord == auth.user.id).select(orderby=db.listing.group_id):
        q = db(db.group_table.id == r.group_id).select().first()
        groupName = q.name

        q = db(db.auth_user.id == r.tenant).select().first()
        tenantName = ""
        if q is not None:
            tenantName = q.first_name + " " + q.last_name 

        tenant_email = ""
        q = db(db.templisting.listingid == r.id).select().first()
        if q is not None:
            tenant_email = q.tenant_email

        # q = db(db.payment_history.listingid == r.id).select().first()

        last_paid = "" 
        paid_this_month = False
        last_paid = ""

        try:
            if int(r.last_paid_month) == int(datetime.now().month):
                paid_this_month = True
                last_paid = r.last_paid
        except:
            logger.info("No previous payment record for this user")

        t = dict(
            id = r.id,
            address = r.address,
            pref_name = r.pref_name,
            group_name = groupName,
            tenant_name = tenantName,
            tenant_id = r.tenant,
            amount = r.amount,
            last_paid = last_paid,
            status = r.status,
            linked = r.linked,
            image_url = r.image_url,
            tenant_email = tenant_email,
            paid_this_month = paid_this_month,


        )
        listings.append(t)

    return response.json(dict(
            listings = listings
            
    ))


@auth.requires_signature()
def find_temp_listings():
    temp_listings = []

    fEmail = auth.user.email if request.vars.theEmail is None else request.vars.theEmail
    for r in db(db.templisting.tenant_email == fEmail).select():
        for m in db(db.listing.id == r.listingid).select():
            landlord = ""
            q = db(db.auth_user.id == m.landlord).select().first()
            landlord = q.first_name + " " + q.last_name
            t = dict(
                id = m.id,
                address = m.address,
                pref_name = m.pref_name,
                amount = m.amount,
                image_url = m.image_url,
                landlord = landlord,
            )
            temp_listings.append(t)


    
    return response.json(dict(
        temp_listings = temp_listings,
    ))


@auth.requires_signature()
def temp_to_permanent():
    

    q = db(db.listing.id == request.vars.theid).select().first()
    q.tenant = auth.user.id
    q.linked = 1
    q.update_record()

    q = db(db.templisting.listingid == request.vars.theid).delete()


    
    return response.json(dict())


@auth.requires_signature()
def get_tenant_listings():
    tenant_listings = []
    for r in db(db.listing.tenant == auth.user.id).select():
        paid_this_month = False
        last_paid = ""
        
            
        try:
            if int(r.last_paid_month) == int(datetime.now().month):
                paid_this_month = True
                last_paid = r.last_paid
        except:
            logger.info("No previous payment record for this user")

        landlord = ""
        q = db(db.auth_user.id == r.landlord).select().first()
        landlord = q.first_name + " " + q.last_name
        landlord_email = q.email

        t = dict(
            last_paid = last_paid,
            paid_this_month = paid_this_month,
            address = r.address,
            pref_name = r.pref_name,
            amount = r.amount,
            image_url = r.image_url,
            id = r.id,
            landlord = landlord,
            cur_month= datetime.now().month,
            tenant_id = r.tenant,
            landlord_id = r.landlord,
            landlord_email = landlord_email,
        )

        tenant_listings.append(t)


    return response.json(dict(
        tenant_listings = tenant_listings,
    ))



def purchase():

    # status = "ok"
    # """Ajax function called when a customer orders and pays for the cart."""
    # if not URL.verify(request, hmac_key=session.hmac_key):
    #     raise HTTP(500)
    # # Creates the charge.
    # try:
    #     import stripe
    #     # Your secret key.
    #     stripe.api_key = myconf.get('stripe.private_key')
    #     token = json.loads(request.vars.transaction_token)
    #     amount = float(request.vars.amount)
    #     try:
    #         charge = stripe.Charge.create(
    #             amount=int(amount * 100),
    #             currency="usd",
    #             source=token['id'],
    #             description="Purchase",
    #         )
    #     except stripe.error.CardError as e:
    #         logger.info("The card has been declined.")
    #         logger.info("%r" % traceback.format_exc())
    
    # except:
    #Insert into the payment_history databse
    db.payment_history.insert(
        for_month = datetime.now().month,
        tenant = auth.user.id,
        landlord = request.vars.landlord_id,
        listingid = request.vars.listing_id,
        updated_on = datetime.utcnow(),
        amount = request.vars.amount,

        
    )

    q = db(db.listing.id == request.vars.listing_id).select().first()
    q.last_paid = datetime.utcnow()
    q.last_paid_month = datetime.now().month
    q.update_record()
    return "ok"


def payment_history_content():
    db.payment_history.insert()
    payment_history = []
    if request.vars.typeUser == "landlord":
        for r in db(db.payment_history.landlord == auth.user.id).select():

            q = db(db.auth_user.id == r.tenant).select().first()
            q2 = db(db.listing.id == r.listingid).select().first()
            t = dict(
                id = r.id,
                for_month = r.updated_on.strftime("%B"),
                tenant_full_name = q.first_name + " " + q.last_name,
                tenant_email = q.email,
                address = q2.address,
                updated_on = r.updated_on,
                amount = r.amount,

            )

            payment_history.append(t)

    elif request.vars.typeUser == "tenant":
        for r in db(db.payment_history.tenant == auth.user.id).select():
            q = db(db.auth_user.id == r.landlord).select().first()
            q2 = db(db.listing.id == r.listingid).select().first()
            t = dict(
                id = r.id,
                for_month = r.updated_on.strftime("%B"),
                landlord_full_name = q.first_name + " " + q.last_name,
                landlord_email = q.email,
                address = q2.address,
                updated_on = r.updated_on,
                amount = r.amount,

            )

            payment_history.append(t)


    return response.json(dict(
        payment_history = payment_history,

    ))