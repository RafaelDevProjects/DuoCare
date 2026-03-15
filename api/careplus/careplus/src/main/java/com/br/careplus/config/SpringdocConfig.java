package com.br.careplus.config;

import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Page;

@Configuration
public class SpringdocConfig {

    static {
        SpringDocUtils.getConfig().replaceWithClass(Page.class, Object.class);
    }
}