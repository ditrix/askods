<?php
return array(
    // Catalog groups routing
    '<lang>/strahovye-uslugi' => 'catalog/catalog/index',
    '<lang>/strahovye-uslugi/<alias>' => 'catalog/catalog/groups',
    // Kupit strahovku
    '<lang>/kupit-strahovku' => 'catalog/buyInsurance/index',
    '<lang>/kupit-strahovku/<alias>' => 'catalog/buyInsurance/inner',
    '<lang>/kupit-strahovku/<buy>/<alias>' => 'catalog/buyInsurance/inner',
);