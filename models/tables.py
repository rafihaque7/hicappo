# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.
from datetime import datetime


db.define_table('user_pref',
    Field('who', 'reference auth_user'),
    Field('what', default='o')
)


db.define_table('group_table',
    Field('name'),
    Field('who', 'reference auth_user', default= auth.user_id),
)

db.define_table('listing',
    Field('address'),
    Field('pref_name'),
    Field('landlord', 'reference auth_user', default=auth.user_id),
    Field('group_id', 'reference group_table'),
    Field('tenant',  'reference auth_user'),
    Field('amount'),
    Field('status',default=False),
    Field('linked',default=0),
    Field('image_url'),
    Field('last_paid_month'),
    Field('last_paid'),
)


db.define_table('payment_history',
    Field('for_month'),
    Field('tenant', 'reference auth_user'),
    Field('landlord', 'reference auth_user'),
    Field('listingid', 'reference listing'),
    Field('updated_on'),
    Field('amount'),
)


db.define_table('templisting',
    Field('tenant_email'),
    Field('listingid', 'reference listing'),
)

db.define_table('maintenance',
    Field('landlord_id', 'reference auth_user'),
    Field('tenant_id', 'reference auth_user'),
    Field('is_resolved', 'boolean',default = False),
    Field('updated_on'),
    Field('date_issued'),
    Field('text_issue'),
    Field('image_url'),
)


# db.define_table('reply_maintenance',
#     Field('maintenance_id', 'reference maintenance'),
#     Field('user_id','reference auth_user'),
#     Field('message_texts')
# )





# db.listing.truncate()
# db.group_table.truncate()
# db.templisting.truncate()
# db.user_pref.truncate()
# db.payment_history.truncate()
# db.auth_user.truncate()
# after defining tales, uncomment below to enable auditing

