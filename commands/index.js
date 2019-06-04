import React from 'react'
import { Form, Field } from 'react-final-form'
import { AppContext, Box, Color, Text, StdinContext } from 'ink'
import TextInput from '../components/TextInput'
import SelectInput from '../components/SelectInput'
import MultiSelectInput from '../components/MultiSelectInput'
import Error from '../components/Error'
import semver from 'semver'
import fetch from 'node-fetch'
import path from 'path'
import ncp from 'ncp'
import Spinner from 'ink-spinner'

const varCache = {
	validateOnlineCheck: true,
	className: 'MyAwesomeComponent'
};
const checkPackage = name => {
	if (varCache[name] === undefined) {
		return fetch(`https://api.npms.io/v2/package/${name}`)
			.then(response => response.json())
			.then(json => {
				varCache[name] = json.code !== 'NOT_FOUND'
				return varCache[name]
			})
	}
	return varCache[name]
};

const copyProject = sData => {
	console.log('sData', sData);

	console.log(__dirname); //=> LOCATION OF 'Binary'
	console.log(process.cwd()); //=> LOCATION where command has been run
	//	https://stackoverflow.com/a/49875811/1835217
	let sourceLocation = __dirname.replace('/build/commands', '/base-angular-component');
	let destinationLocation = process.cwd() + '/' + sData.name;
	ncp(sourceLocation, destinationLocation, function (err) {
		if (err) {
			return console.error(err);
		}
		// console.log('done!');
	});
};

const propagateNpmCheck = (param) => {
	if (param && param.value === 'false') {
		varCache.validateOnlineCheck = false;
	}

};

const changeComponentName = (input) => {
	input.value = varCache.className;
	fields[2].value = varCache.className;
};

const propagateComponentName = (param) => {
	const makeCmpntName = (name) => {
		return name.split('-').map((ele) => {
			return ele.split('').map((elem, idx) => {
				if (idx === 0) {
					return elem.toUpperCase();
				} else {
					return elem;
				}
			}).join('');
		}).join('');
	};
	if (param && param.value) {
		// TODO: This does not work.
		varCache.className = makeCmpntName(param.value);
		fields[2].placeholder = makeCmpntName(param.value);
		// console.log('varCache.className to', param);
	}

};




const fields = [
	{
		name: 'npmready',
		label: 'Check NPM available package name ?',
		Input: SelectInput,
		inputConfig: {
			items: [
				{ label: 'Yes', value: 'true' },
				{ label: 'No', value: 'false' }
			]
		}
	},
	{
		name: 'name',
		label: 'Package Name',
		validate: value => {
			if (!value) {
				return 'Required'
			}
			const check = checkPackage(value);
			if (varCache.validateOnlineCheck && check && check.then) {
				return check.then(exists =>
					exists ? 'Package exists already!' : undefined
				)
			}
		},
		format: value =>
			value
				? value
						.toLowerCase()
						.replace(/[^a-z \\-]/g, '')
						.replace(/ /g, '-')
				: '',
		placeholder: 'my-awesome-component',
		Input: TextInput
	},
	{
		name: 'cname',
		label: 'Component Name',
		placeholder: varCache.className,
		// format: value =>
		// 	value
		// 		? value
		// 			.replace(/[^a-z \\-]/g, '')
		// 			.replace(/ /g, '-')
		// 		: '',
		// validate: value =>
		// 	!value
		// 		? 'Required'
		// 		: semver.valid(value)
		// 		? undefined
		// 		: 'Invalid semantic version',
		Input: TextInput
	},
	{
		name: 'version',
		label: 'Version',
		placeholder: '1.0.0',
		format: value => (value === undefined ? '' : value.replace(/[^0-9.]/g, '')),
		validate: value =>
			!value
				? 'Required'
				: semver.valid(value)
				? undefined
				: 'Invalid semantic version',
		Input: TextInput
	},
	{
		name: 'language',
		label: 'Language',
		Input: SelectInput,
		inputConfig: {
			items: [
				{ label: 'Javascript', value: 'javascript' },
				{ label: 'Typescript', value: 'typescript' }
			]
		}
	},
	{
		name: 'technologies',
		label: 'Technologies',
		Input: MultiSelectInput,
		format: null, // prevents empty value from being ''
		inputConfig: {
			items: [
				{ label: '⚛️ React', value: 'react' },
				{ label: 'Angular', value: 'angular' },
				{ label: 'Redux', value: 'redux' },
				{ label: 'GraphQL', value: 'graphql' },
				{ label: '🏁 React-Final-Form', value: 'react-final-form' },
				{ label: '💅 Styled Components', value: 'styled-components' },
				{ label: '👨‍🎤 Emotion', value: 'emotion' },
				{ label: '🌈‍ Ink', value: 'ink' }
			]
		}
	}
];

class Test extends React.Component {
	render() {
		return <Text>Hello</Text>;
	}

	componentDidMount() {
		this.props.setRawMode(true);
		this.props.stdin.on('data', data => {
			// console.log(path.dirname()); //=> 'hello'
		});
	}
}


/// SquinkyForm
export default function SquinkyForm() {
	const [activeField, setActiveField] = React.useState(0);
	const [submission, setSubmission] = React.useState();

	return submission ? (
		<AppContext.Consumer>
			{({ exit }) => {

				// copyProject(submission);

				// IF / Else to return success or not.
				setTimeout(exit);
				return (
					<Box flexDirection="column" marginTop={1}>
						<Color blue>
							<Text bold>Values submitted:</Text>
						</Color>
						<Box>{JSON.stringify(submission, undefined, 2)}</Box>
					</Box>
				)
			}}
		</AppContext.Consumer>
	) : (
		<Box flexDirection="column">
			{/*<StdinContext.Consumer>
				{({stdin, setRawMode}) => (
					<Test stdin={stdin} setRawMode={setRawMode}/>
				)}
			</StdinContext.Consumer>*/}
			<Form onSubmit={setSubmission}>
				{({ handleSubmit, validating }) => (
					<Box flexDirection="column">
						{fields.map(
							(
								{
									name,
									label,
									placeholder,
									format,
									validate,
									Input,
									inputConfig
								},
								index
							) => (
								<Field name={name} key={name} format={format} validate={validate}>
									{({ input, meta }) => (
										<Box flexDirection="column">
											<Box>
												<Text bold={activeField === index}>{label}: </Text>
												{activeField === index ? (
													<Input
														{...input}
														{...inputConfig}
														placeholder={placeholder}
														onSubmit={() => {
															if (meta.valid && !validating) {
																setActiveField(value => value + 1) // go to next field
																if (activeField === fields.length - 1) {
																	// last field, so submit
																	handleSubmit()
																}
															} else {
																input.onBlur() // mark as touched to show error
															}
														}}
													/>
												) : (
													(input.value && <Text>{input.value}</Text>) ||
													(placeholder && <Color gray>{placeholder}</Color>)
												)}
												{validating && name === 'name' && (
													<Box marginLeft={1}>
														<Color yellow>
															<Spinner type="dots" />
														</Color>
													</Box>
												)}

												{/*  DEV Some Condition */}
												{name === 'npmready' && (propagateNpmCheck(input))}
												{name === 'name' && (propagateComponentName(input))}
												{name === 'cname' && input.value === undefined && (input.value = placeholder)}
												{/* END Some Condition */}

												{meta.invalid && meta.touched && (
													<Box marginLeft={2}>
														<Color red>✖</Color>
													</Box>
												)}
												{meta.valid && meta.touched && meta.inactive && (
													<Box marginLeft={2}>
														<Color green>✔</Color>
													</Box>
												)}
											</Box>
											{meta.error && meta.touched && <Error>{meta.error}</Error>}
										</Box>
									)}
								</Field>
							)
						)}
					</Box>
				)}
			</Form>
		</Box>
	)
}
