from mongoengine import Document, EmbeddedDocument
from mongoengine.fields import (
    DateTimeField,
    ListField,
    ReferenceField,
    StringField,
    IntField,
    URLField,
    EmailField,
    DictField,
    
)

from graphene import ObjectType

class Room(Document):
    _id = StringField()
    name = StringField()
    location = DictField() //
    members = ListField(User)


class User(Document):
    _id = StringField()

    email_addr = EmailField()
    full_name = StringField()
    one_liner = StringField()
    birthday = DateTimeField()
    pic = URLField()

    member_since = DateTimeField()
    device_token = StringField()

    status = StringField()
