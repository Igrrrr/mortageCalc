import {increasedRiskCoefficients, coefficientsList} from './rates.js'


const form = document.forms.form
const fieldsetTypeOfEstate = form.fieldsetTypeOfEstate
const typesOfApartment = document.getElementById('typesOfApartment')
const fieldsetLoanParams = form.fieldsetLoanParams
const bankSelect = document.getElementById('bankList')
const insuranceTypes = document.getElementById('insuranceTypes')
const insuranceTypesElements = form.insuranceTypes.elements
const lifeRiskFieldset = document.getElementById('lifeRisk')
const propertyRiskFieldset = document.getElementById('estateRisk')
const titleRiskFieldset = document.getElementById('titleRisk')
const countBtn = document.getElementById('count')
const calculatedCost = document.querySelector('.calculated')
const missingInformationFieldset = document.getElementById('missingInformation')
const missingInformationList = document.getElementById('missingInformationList')



// // объект в котором будут сохраняться данные, вводимые клиентом (заполнен не до конца).
// По какой-то причине поле amount не сохраняет данные.
const calculatedParams = {
	amount: null, //поставить логичный тип
	typeOfEstate: null,
	selectedBankId: null,
	gender: null,
	age: null,
	occupation: null,
	illness: null,
	buildingYear: null,
	flammable: null,
	durationOfOwnership: null,
	insuranceCoefficients: []
}


const banks = [
	{
		id: '9098c7d8-4cdc-4b69-8237-58d0255cca87',
		name: 'Metrostroy',
		risks: {
			lifeRisk: ['buildingApartment', 'readyApartment', 'house', 'landLot'],
			estateRisk: ['buildingApartment', 'readyApartment', 'house', 'landLot'],
			titleRisk: ['readyApartment', 'house', 'landLot']
		},
	},
	{
		id: 'ac9a52d8-591c-4137-98b3-961f4e5293db',
		name: 'Trest',
		risks: {
			lifeRisk: ['buildingApartment', 'readyApartment', 'house'],
			estateRisk: ['buildingApartment', 'readyApartment', 'house'],
			titleRisk: ['readyApartment', 'house']
		},
	},
	{
		id: '47dccc5a-1f20-4bb0-a3c1-72aa0e091665',
		name: 'IP',
		risks: {
			lifeRisk: ['buildingApartment', 'readyApartment', 'house', 'landLot'],
			estateRisk: ['buildingApartment', 'readyApartment', 'house', 'landLot'],
		},
	},
]


// удаление checked
const uncheckInputs = (elements) => {
	for (const element of elements) {
		if ('checked' in element) element.checked = false
	}
}

// удаление disabled
const removingValues = (elements) => {
	for (const element of elements) {
		if (element.value) element.value = ''
	}
}


// разблокировка филдсета выбора состояния квартиры
const checkTypeOfEstate = (event) => {
	switch (event.target.value) {
		case 'apartment':
			typesOfApartment.classList.add('active')
			break;
		case 'house':
		case 'landLot':
			typesOfApartment.classList.remove('active')
			uncheckInputs(typesOfApartment.children)
	}
}


// добавление типа имущества в calculatedParams
const calculateEstateParams = (event) => {
  if (event.target.value === 'apartment') {
		calculatedParams.typeOfEstate = null
	} else {
		calculatedParams.typeOfEstate = event.target.value
	}
}


// блокировка банков выпадающем списке, не страхующих выбранное имущество
const filterBankList = () => {
	if (!calculatedParams.typeOfEstate) return
	const inactiveBanks = banks.reduce((acc, el) => {
		if(!Object.values(el.risks).flat().includes(calculatedParams.typeOfEstate)) {
			acc.add(el.id)
		}
		return acc
	}, new Set())

	for (const el of bankSelect.children) {
		if (inactiveBanks.has(el.value)) {
			if (el.value === calculatedParams.selectedBankId) {
				calculatedParams.selectedBankId = null
			}
			el.setAttribute('disabled', true)
		} else {
			el.removeAttribute('disabled')
		}
	}
}


// разблокировка филдсета параметров кредита
const inputActivate = () => {
	calculatedParams.typeOfEstate 
		? fieldsetLoanParams.removeAttribute('disabled')
		: fieldsetLoanParams.setAttribute('disabled', true)
}

// добавление ID банка и суммы ипотеки в calculatedParams
const calculateBankParam = (event) => {
	const { name, value } = event.target
  calculatedParams[name] = isNaN(value) ? value : Number(value)
}


const estatesHandler = (event) => {
  checkTypeOfEstate(event)
  calculateEstateParams(event)
	filterBankList()
	inputActivate()
}


// разблокировка чекбоксов в филдсете insuranceTypes в зависимости от выбранного банка
const selectBank = (event) => {
	const targetBank = banks.find(el => (
		el.id === event.target.value
	))
	targetBank && toggleInsuranceTypes(targetBank)
} 


const toggleInsuranceTypes = (selectedBank) => {
	for (const el of insuranceTypesElements) {
		if (Object.prototype.hasOwnProperty.call(selectedBank.risks, el.value)) {
			el.removeAttribute('disabled')
		} else {
			el.setAttribute('disabled', true)
			el.checked = false
			document.getElementById(el.value).classList.remove('active')
		}
	}
}


// разблокировка филдсетов соответствующих видов страхования
const enablingTypesOfInsurance = (event) => {
	if (event.target.checked) {
		document.getElementById(event.target.value).classList.add('active')
	} else {
		uncheckInputs(document.getElementById(event.target.value).elements)
		removingValues(document.getElementById(event.target.value).elements)
		removingUnactualParams(event.target.value)
		document.getElementById(event.target.value).classList.remove('active')
	}
}


// удаление указанных параметров
const removingUnactualParams = (insuranceType) => {
	switch (insuranceType) {
		case 'lifeRisk':
			calculatedParams.age = null;
			calculatedParams.gender = null;
			calculatedParams.illness = null;
			calculatedParams.occupation = null
			break
		case 'estateRisk':
			calculatedParams.buildingYear = null
			calculatedParams.flammable = null
			break
		case 'titleRisk':
			calculatedParams.durationOfOwnership = null
	} //проверить наличие checked
}


//добавления информации из филдсета про жизнь
const setLifeInshuranceProps = (event) => {
	if (event.target.name !== 'age') {
			calculatedParams[event.target.name] = event.target.value
			//console.log(event.target.value, event.target);
			if (event.target.checked === false) calculatedParams[event.target.name] = null
	} else {
			const date = new Date(event.target.value)
			const now = new Date()
			let age
			if (now.getMonth() > date.getMonth() ||
					(now.getMonth() === date.getMonth() && now.getDate() > date.getDate())
			) {
					age = now.getFullYear() - date.getFullYear()
			} else {
					age = now.getFullYear() - date.getFullYear() - 1
			}
			if (age < 18 || age > 74) {
					calculatedParams.age = null
					if (!document.getElementById('dateOfBirth').nextElementSibling) {
						outputMessage('dateOfBirth', '<strong>Вам должно быть от 18 до 74 лет</strong>')
					}
			} else {
				document.getElementById('dateOfBirth').nextElementSibling.remove()
					calculatedParams.age = age
			}
	}
};


const outputMessage = (element, text) => {
	const message = document.createElement('div')
	message.innerHTML = text
	document.getElementById(element).after(message)
}


// добавление года постройки и информации о горючести
const setPropertyInsuranceProps = (event) => {
	calculatedParams[event.target.name] = event.target.value
}

// добавление информации о повышенном риске по титулу
const setTitleInsuranceProps = (event) => {
	calculatedParams[event.target.name] = event.target.value
}


//добавление страхового коэффициента на основании пола и возраста
const getLifeCoefficients = () => {
	const {selectedBankId, gender, age, insuranceCoefficients, occupation, illness} = calculatedParams;
	const genderCoefficient = (coefficientsList.find(item => item.bankID === selectedBankId)?.[gender])?.[age];
	if (!genderCoefficient) {
		throw new Error('тариф по жизни не подгрузился!')
	} 
	insuranceCoefficients.push(genderCoefficient)	
	if(occupation === '1') {insuranceCoefficients.push(increasedRiskCoefficients.life)};
	if(illness ==='1') {insuranceCoefficients.push(increasedRiskCoefficients.life)}
}



//добавление страхового коэффициента на основании года постройки дома
const getEstateCoefficients = () => {
	const {selectedBankId, buildingYear, flammable, insuranceCoefficients} = calculatedParams;
	const estateCoefficients = coefficientsList.find(item => item.bankID === selectedBankId).estate
	if (!estateCoefficients) {
		throw new Error('тариф по имуществу не подгрузился!')
	} 
	if(buildingYear <= 1960) {
		insuranceCoefficients.push(estateCoefficients[1960]);
	} else if (buildingYear >= 1961 && buildingYear <= 2000) {
		insuranceCoefficients.push(estateCoefficients[1961]);
	} else {
		insuranceCoefficients.push(estateCoefficients[2000]);
	}
	if(flammable === '1') {insuranceCoefficients.push(increasedRiskCoefficients.estate)}
	console.log(calculatedParams);
}


// добавление страхового коэффициента по титулу
const getTitleCoefficients = () => {
	const {selectedBankId, durationOfOwnership, insuranceCoefficients} = calculatedParams
	const titleCoefficient = coefficientsList.find(item => item.bankID === selectedBankId).title
	if (!titleCoefficient) {
		throw new Error('тариф по имуществу не подгрузился!')
	} 
	insuranceCoefficients.push(titleCoefficient)
	if(durationOfOwnership === '1') {insuranceCoefficients.push(increasedRiskCoefficients.title)}
	console.log(calculatedParams);
}

// проверка необходимости добавления тарифов по рискам
const checkActualTypesOfInsurance = (funcLife, funcEstate, funcTitle) => {
	for(let el of insuranceTypesElements) {
		let temp 
		if(el.checked) temp = el.value
		if (temp === 'lifeRisk') {
			funcLife()
		};
		if (temp === 'estateRisk') {
			funcEstate()
		};
		if (temp === 'titleRisk') {
			funcTitle()
		};
		console.log(temp);
	}
}	


const noTypeOfEstate = (message) => {
	missingInformationList.insertAdjacentHTML('beforeend', message)
	missingInformationFieldset.classList.add('active')
	if(!missingInformationFieldset.classList.value === 'fieldset active') {
		missingInformationFieldset.classList.add('active')
	}
}

const checkCreditInformation = () => {
	while (missingInformationList.firstChild) {
		missingInformationList.removeChild(missingInformationList.firstChild)
	}
	calculatedParams.typeOfEstate === null && noTypeOfEstate('<p>Выберете объект ипотеки</p>')
	calculatedParams.selectedBankId === null && noTypeOfEstate('<p>Выберете банк</p>')
	calculatedParams.amount === null && noTypeOfEstate('<p>Укажите сумму ипотеки</p>')
}

const checkAvailibilityLifeInformation = () => {
	calculatedParams.gender === null && noTypeOfEstate('<p>Укажите пол</p>')
	calculatedParams.age === null && noTypeOfEstate('<p>Укажите год рождения</p>')
	calculatedParams.occupation === null && noTypeOfEstate('<p>Укажите профессию</p>')
}

const checkAvailibilityEstateInformation = () => {
	calculatedParams.buildingYear === null && noTypeOfEstate('<p>Укажите год постройки</p>')
}

const checkAvailibilityTitleInformation = () => {}

const countSum = () => {
	checkCreditInformation()
	checkActualTypesOfInsurance(checkAvailibilityLifeInformation, checkAvailibilityEstateInformation, checkAvailibilityTitleInformation)
	if(calculatedParams.insuranceCoefficients.length > 0) calculatedParams.insuranceCoefficients.length = 0;
	checkActualTypesOfInsurance(getLifeCoefficients, getEstateCoefficients, getTitleCoefficients)
	const mainCoefficient = calculatedParams.insuranceCoefficients.reduce((acc = 0, el) => acc += el)
	const result = calculatedParams.amount * (mainCoefficient / 100)
	console.log(calculatedParams.insuranceCoefficients);
	calculatedCost.innerHTML = result.toFixed(2)
	//console.log(result);
}

// события
fieldsetTypeOfEstate.addEventListener('change', estatesHandler)
bankSelect.addEventListener('change', selectBank)
insuranceTypes.addEventListener('change', enablingTypesOfInsurance)
lifeRiskFieldset.addEventListener('change', setLifeInshuranceProps)
propertyRiskFieldset.addEventListener('change', setPropertyInsuranceProps)
titleRiskFieldset.addEventListener('change', setTitleInsuranceProps)
fieldsetLoanParams.addEventListener('change', calculateBankParam)
countBtn.addEventListener('click', countSum)




