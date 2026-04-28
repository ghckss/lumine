package com.melancholy.server.support.api

import com.melancholy.server.support.SupportResource

fun SupportResource.toApiResponse(): SupportResourceResponse =
    SupportResourceResponse(
        code = code,
        title = title,
        phone = phone,
        description = description
    )
