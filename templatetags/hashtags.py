# -*- coding: utf-8 -*-
from django import template

register = template.Library()

@register.inclusion_tag('hashtags/hashtags.html')
def hashtagswidget(id, classes):
    return { 'id': id, 'classes': classes }

