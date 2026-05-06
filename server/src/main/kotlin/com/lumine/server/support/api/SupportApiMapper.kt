package com.lumine.server.support.api

import com.lumine.server.support.SupportResource

fun SupportResource.toApiResponse(): SupportResourceResponse =
    SupportResourceResponse(
        code = code,
        title = title,
        phone = phone,
        description = description
    )
