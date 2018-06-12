# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------


def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html

    if you need a simple wiki simply replace the two lines below with:
    return auth.wiki()
    """
    # response.flash = T("Hello World")

    if auth.user is not None: #if the user is logged in
        if db(db.user_pref.who == auth.user.id).select().first(): # if an entry in the database exists
            if db((db.user_pref.who == auth.user.id) & (db.user_pref.what == 'tenant')).select().first():
                redirect(URL('default','tenant'))
            else:
                redirect(URL('default','landlord'))
        else:
            redirect(URL('default','prefpage'))


    return dict(message=T('Welcome to web2py!'))

def prefpage():
    return dict()

def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()

@auth.requires_login()
def tenant():
    return dict()

@auth.requires_login()
def landlord():
    return dict()

@auth.requires_signature()
def updatePref():
    if request.args(0) is not None:
        db.user_pref.insert(
            who = auth.user.id,
            what = request.args(0),
        )
    redirect(URL('default','index'))


# @auth.requires_signature()
# def payment_history():
#     if request.args(0) == "landlord":
#         q = db.payment_history.landlord == auth.user.id
#         form = SQLFORM.grid(
#             q,
#             fields = [db.payment_history.tenant,db.payment_history.amount,db.payment_history.updated_on],
#         )

#     elif request.args(0) == "tenant":
#         q = db.payment_history.id > 0
#         form = SQLFORM.grid(
#             q,
#             fields = [db.payment_history.landlord,db.payment_history.amount,db.payment_history.updated_on],
#         )

#     return dict(form=form)






