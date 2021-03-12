/**/
function get_select_value(id){
	var select_item = document.getElementById(id);
	var res = select_item.options[select_item.selectedIndex].value;
	return res;
}

function calc_pay(id){



	var res = false;
	switch(id){
	  case 159: return calc_osgpo(); break;
	  case 160: return calc_housing(); break;
	  case 161: return calc_housing_plus(); break;
	}

	return false;
}

function calc_housing_plus(){
	var res = '';
	var ihistory = 0;
	var hlevel  = 0;
	var isumm = 0;
	
	ihistory = get_select_value('f_strahovaja-istorija-do-3-h-let');
	hlevel  = get_select_value('f_-raspolozhenie-kvartiry-v-mnogokvartirnom-dome');
    isumm = get_select_value('f_razmer-strahovoj-summy');

	switch( isumm ){
		case '50-000-grn': isumm = 228; break;
		case '35-000-grn': isumm = 168; break;
	}

	switch(hlevel){
		case 'poslednij-etazh': hlevel = 1.1; break;
		case 'prochie-etazhi': hlevel = 1; break;
	}
	//res = isumm;
	
	switch(ihistory){
	 case 'dogovor-zakljuchaetsja-vpervye'     : ihistory = 1; break;
	 case 'bezubytochnaja-strahovaja-istorija' : ihistory = 0.9; break;
	}
	
    res = ihistory*hlevel*isumm;


	 
	if(res) { 
	
		res = res.toFixed(2);
		
		document.getElementById('pay_result_id').innerHTML =  '<span class="result_value">' + res + '</span><span class="result_currensy"> грн.</span>';
    document.getElementById('media-result-id').innerHTML =  res  + ' грн.'
    
	}	
	
	return true;
}

function calc_housing(){
	res = '';
	var ihistory = 0;
	var hlevel  = 0;
	var isumm = 0;
	
	ihistory = get_select_value('f_strahovaja-istorija-do-3-h-let');
	hlevel  = get_select_value('f_-raspolozhenie-kvartiry-v-mnogokvartirnom-dome');
    isumm = get_select_value('f_razmer-strahovoj-summy');

	switch( isumm ){
		case '50-000-grn': isumm = 190; break;
		case '35-000-grn': isumm = 140; break;
	}

	switch(hlevel){
		case 'poslednij-etazh': hlevel = 1.1; break;
		case 'prochie-etazhi': hlevel = 1; break;
	}
	//res = isumm;
	
	switch(ihistory){
	 case 'dogovor-zakljuchaetsja-vpervye'     : ihistory = 1; break;
	 case 'bezubytochnaja-strahovaja-istorija' : ihistory = 0.9; break;
	}
	
    res = ihistory*hlevel*isumm;


	 
	if(res) { 
	
		res = res.toFixed(2);
		
		document.getElementById('pay_result_id').innerHTML =  '<span class="result_value">' + res + '</span><span class="result_currensy"> грн.</span>';
   document.getElementById('media-result-id').innerHTML =  res  + ' грн.'    
	}	
	
	return true;
}

function calc_osgpo(){



	var res = 0;
	var bp = 180; // базовый платеж
	var k1 = 0; // тип ТС
	var k2 = 0; // место регистрации
	var k3 = 0; // сфера использования
  var k4 = 0; // водительский стаж
	var k5 = 0; // Период использования ТС
	var bmalus = 0; // бонус-малус
	var pensioner = 0; // пенсионер
	
	k1= get_select_value('f_tip-transportnogo-sredstva');
	switch (k1){
		case "a1---mototsikl-do-300-sm-vkljuchitelno": k1 = 0.34; break;
		case "a2--mototsikl--bolee-300-sm": k1 = 0.68; break;

		case "c1---gruzovik-do-2-tonn-vkljuchitelno": k1= 2; break;
		case "c2---gruzovik-bolee-2-tonn":k1= 2.18; break;

		case "d1--avtobus-do-20-litsvkljuchitelno": k1= 2.55; break;
		case "d2----svyshe-20-lits":  k1= 3; break;

		case "e--pritsep-k-gruzovym-ts": k1= 0.5; break;
		case "f--pritsep-k-legkovym-ts": k1= 0.34; break;

		case "v1----legkovoe-avto-obem-dvigatelja-do-1600-sm": k1= 1; break;
		case "v2----legkovoe-avto-ot-1601--2000-sm": k1= 1.14; break;
		case "v3---legkovoe-avto-ot-ot-2001--3000-sm": k1= 1.18; break;
		case "v4---legkovoe-avto-obem-dvigatelja--bolee-3000-sm": k1= 1.82; break;
	}
	
	k2= get_select_value('f_mesto-registratsii');
	switch (k2){

		case "za-predelami-ukrainy":k2= 4; break; //за пределами Украины  
		case "g-evpatorija": 		k2= 2.2; break; //г. Евпатория 
		case "g-ivano-frankovsk": 	k2= 2.2; break; // г. Ивано-Франковск 
		case "g-irpen": 			k2= 2.5; break; // г. Ирпень 
		case "g-alchevsk": 			k2= 2.2; break; // г. Алчевск 
		case "g-belaja-tserkov": 	k2= 2.2; break; //г. Белая церковь 
		case "g-berdjansk":	 		k2= 2.2; break; //г. Бердянск 
		case "g-borispol":	 		k2= 2.5; break; //г. Борисполь 
		case "g-bojarka":			k2= 2.5; break; //г. Боярка  
		case "g-brovary":			k2= 2.5; break; //г. Бровары  
		case "g-vinnitsa":			k2= 2.2; break; //г. Винница  
		case "g-vasilkov":			k2= 2.5; break; //г. Васильков  
		case "g-vyshgorod":			k2= 2.5; break; //г. Вышгород  
		case "g-vishnevoe":			k2= 2.5; break; //г. Вишневое  
		case "g-gorlovka":			k2= 2.2; break; //г. Горловка  
		case "g-dnepropetrovsk":	k2= 3.4; break; //г. Днепропетровск  
		case "g-donetsk":			k2= 2.8; break; //г. Донецк  
		case "g-zhitomir":			k2= 2.2; break; //г. Житомир  
		case "g-zaporozhe":			k2= 2.8; break; //г. Запорожье  
		case "g-kamenets-podolskij":k2= 2.2; break; //г. Каменец-Подольский  
		case "g-kamenskoe":			k2= 2.2; break; //г. Каменское  
		case "g-kerch":				k2= 2.2; break; //г. Керч  
		case "g-kiev": 				k2= 4.8; break; // Киев
		case "g-kirovograd":		k2= 2.2; break; //г. Кировоград  
		case "g-kramatorsk":		k2= 2.2; break; //г. Краматорск  
		case "g-kremenchug":		k2= 2.2; break; //г. Кременчуг  
		case "g-krivoj-rog":		k2= 2.8; break; //г. Кривой Рог  
		case "g-lisichansk":		k2= 2.2; break; //г. Лисичанск  
		case "g-lugansk":			k2= 2.2; break; //г. Луганск  
		case "g-lutsk":				k2= 2.2; break; //г. Луцк  
		case "g-lvov":				k2= 2.8; break; //г. Львов  
		case "g-mariupol":			k2= 2.2; break; //г. Мариуполь  
		case "g-melitopol":			k2= 2.2; break; //г. Мелитополь  
		case "g-nikolaev":			k2= 2.2; break; //г. Николаев  
		case "g-nikopol":			k2= 2.2; break; //г. Никополь  
		case "g-odessa":			k2= 3.4; break; //г. Одесса  
		case "g-pavlograd":			k2= 2.2; break; //г. Павлоград  
		case "g-poltava":			k2= 2.2; break; //г. Полтава  
		case "g-rovno":				k2= 2.2; break; //г. Ровно  
		case "g-severodonetsk":		k2= 2.2; break; //г. Северодонецк  
		case "g-simferopol":		k2= 2.2; break; //г. Симферополь  
		case "g-sevastopol":		k2= 2.2; break; //г. Севастополь  
		case "g-slavjansk":			k2= 2.2; break; //г. Славянск  
		case "g-summy":				k2= 2.2; break; //г. Суммы  
		case "g-ternopol":			k2= 2.2; break; //г. Тернополь  
		case "g-uzhgorod":			k2= 2.2; break; //г. Ужгород  
		case "g-harkov":			k2= 3.4; break; //г. Харьков  
		case "g-herson":			k2= 2.2; break; //г. Херсон  
		case "g-hmelnitskij":		k2= 2.2; break; //г. Хмельницкий  
		case "g-chernovtsy":		k2= 2.2; break; //г. Черновцы  
		case "g-cherkassy":			k2= 2.2; break; //г. Черкассы  
		case "g-chernigov":			k2= 2.2; break; //г. Чернигов  
		case "naselennyj-punkt-kotoryj-ne-ukazan-v-predyduschih-punktah":k2= 1.5; break; //нет в списке
		
	}
	
/*	k3= get_select_value('f_sfery-ispolzovanija-ts');
	switch (k3){
		case "kommercheskoe": 		k3=1.4; break; //Коммерческое
		case "lichnoe-ispolzvanie": k3=1; break; //Личное использвание
		case "chastnoe": 			k3=1; break; //Частное
	}*/
  k3 = 1
	
/*	k4 = get_select_value('f_voditelskij-stazh-k4');
	switch(k4){
		case "dlja-juridicheskih-lits": 	k4 = 1.2; break; //для юридических лиц
		case "fiz-litso-ot-3-i-bolee-let": k4 = 1.5; break; //Физ. лицо от 3 и более лет
		case "fiz-litso-do-3-let": 		k4 = 1.5; break; //Физ. лицо до 3 лет
	}
*/	k4 = 1.76

	
	
/*
	k5 =  get_select_value('f_period-ispolzovanija-ts-k5');
	
	switch(k5){
		case "12-mesjatsev": k5 = 1;   break;  //  12 месяцев
		case "6-mesjatsev":  k5 = 0.7; break;  //  6 месяцев
		case "7-mesjatsev":  k5 = 0.75; break; // 7  месяцев
	}
*/	k5 = 1

/*
	f_bmalus = get_select_value('f_bmalus'); // юонус-малус	
	switch(f_bmalus){
		case "bmalus_0": bmalus = 1; break;
		//case "bmalus_10": bmalus = 0.9; break;
		case "bmalus_20": bmalus = 0.9; break;
	}*/
	f_bmalus = 0.9
  /*alert(f_bmalus);*/
/*
	f_pensioner = get_select_value('f_pensioner'); // пенсионер
  switch(f_pensioner){
  	case "pensioner_da":   pensioner = 0.5; break;
  	case "pensioner_net":  pensioner = 1; break;
  }*/
  f_pensioner = 1
 /* alert(f_pensioner);*/

 //alert(res);


  //res = bp * k1 * k2 * k3 * k4 * k5 * bmalus * pensioner;
	res = bp * k1 * k2 * k4;



	if(res) { 
	
			//res = res.toFixed(2);
			res = Math.round(res);
// 
	//console.log(bp)
		
	document.getElementById('pay_result_id').innerHTML = '<span class="result_value">' + res + '</span><span class="result_currensy"> грн.</span>';
   document.getElementById('media-result-id').innerHTML =  res  + ' грн.'    
	}
	
	return true;
} 




