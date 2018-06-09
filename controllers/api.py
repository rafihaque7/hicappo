# Here go your api methods.

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

    logger.info(thegroupid)
    t_id = db.listing.insert(
        address = theaddress,
        pref_name = theprefname,
        group_id = thegroupid,
        amount = theamount,
    )

    s_id = db.templisting.insert(
        tenant_email = thetenantEmail,
        listingid = t_id,
    )


    return response.json(dict(

    ))

@auth.requires_signature()
def getListings():

    listings = []

    for r in db(db.listing.landlord == auth.user.id).select(orderby=db.listing.id):
        q = db(db.group_table.id == r.group_id).select().first()
        groupName = q.name

        q = db(db.auth_user.id == r.tenant).select().first()
        tenantName = ""
        if q is not None:
            tenantName = q.first_name + q.last_name 

        #Work on the 
        t = dict(
            id = r.id,
            address = r.address,
            pref_name = r.pref_name,
            group_name = groupName,
            tenant_name = tenantName,
            tenant_id = r.tenant,
            amount = r.amount,
            last_paid = r.last_paid,
            status = r.status,
            linked = r.linked,

        )
        listings.append(t)

    return response.json(dict(
            listings = listings
            
    ))