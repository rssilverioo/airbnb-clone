'use client';


import useRentModal from '@/app/hooks/useRentModal';
import Modal from './Modal';
import { useMemo, useState } from 'react';
import Heading from '../Heading';
import { categories } from '../navbar/Categories';
import CategoryInput from '../inputs/CategoryInput';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import CountrySelect from '../inputs/CountrySelect';
import dynamic from 'next/dynamic';
import Counter from '../inputs/Counter';
import ImageUpload from '../inputs/ImageUpload';
import Input from '../inputs/input';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';


enum STEPS {
	CATEGORY = 0,
	LOCATION = 1,
	INFO = 2,
	IMAGES = 3,
	DESCRIPTION = 4,
	PRICE = 5
}

const RentModal = () => {
	const router = useRouter();
	const rentModal = useRentModal();


	const [step, setStep] = useState(STEPS.CATEGORY);
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: {
			errors,
		},
		reset
	} = useForm<FieldValues>({
		defaultValues: {
			category: '',
			location: null,
			guestCount: 1,
			roomCount: 1,
			bathroomCount: 1,
			imageSrc: '',
			price: 1,
			title: '',
			description: ''

		}
	});

	const category = watch('category');
	const location = watch('location');
	const guestCount = watch('guestCount');
	const roomCount = watch('roomCount');
	const bathroomCount = watch('bathroomCount');
	const imageSrc = watch('imageSrc');


	const Map = useMemo(() => dynamic(() => import ('../Map'), {
		ssr: false
	}), [location]);


	const setCustomValue = (id: string, value: any) => {
		setValue(id, value, {
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	const onBack = () => {
		setStep((value) => value - 1);
	};


	const onNext = () => {
		setStep((value) => value + 1);
	};

	const onSubmit: SubmitHandler<FieldValues> = (data) => {
		if(step !== STEPS.PRICE) {
			return onNext();
		}
		setIsLoading(true);

		axios.post('/api/listings', data)
			.then(() => {
				toast.success('Criado com sucesso!');
				router.refresh();
				reset();
				setStep(STEPS.CATEGORY);
				rentModal.onClose();
			})
			.catch(() => {
				toast.error('Alguma coisa esta errada');
			}).finally(() => {
				setIsLoading(false);
			});
	};

	const actionLabel = useMemo(() => {
		if (step === STEPS.PRICE) {
			return 'Criar';
		}

		return 'Proximo';
	}, [step]);


	const secondaryActionLabel = useMemo(() => {
		if (step === STEPS.CATEGORY) {
			return undefined;
		}

		return 'Voltar';
	}, [step]);


	let bodyContent = (
		<div className='flex flex-col gap-8'>
			<Heading
				title='Qual destas opções melhor descreve o seu lugar?'
				subtitle='Escolha uma categoria'
			/>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto'>
				{categories.map((item) => (
					<div key={item.label} className='col-span-1'>
						<CategoryInput onClick={(category) => setCustomValue('category', category)} selected={category === item.label}  label={item.label} icon={item.icon} />
					</div>
				))}
			</div>
		</div>
	);


	if(step === STEPS.LOCATION) {
		bodyContent = (
			<div className='flex flex-col gap-8 '>
				<Heading
					title='Onde fica sua casa?'
					subtitle='Ajude o hóspede a encontrar você!'
				/>
				<CountrySelect
					value={location}
					onChange={(value) => setCustomValue('location', value)}
				/>
				<Map
					center={location?.latlng}
				/>
			</div>
		);
	}

	if(step === STEPS.INFO) {
		bodyContent = (
			<div className='flex flex-col gap-8'>
				<Heading
					title='Compartilhe algumas noções básicas sobre sua casa'
					subtitle='Que comodidades você tem?'
				/>
				<Counter
					title='Hospedes'
					subtitle='Quantos hospedes você permite?'
					value={guestCount}
					onChange={(value) => setCustomValue('guestCount', value)}
				/>
				<hr />
				<Counter
					title='Quartos'
					subtitle='Quantos quartos você tem?'
					value={roomCount}
					onChange={(value) => setCustomValue('roomCount', value)}
				/>
				<hr />
				<Counter
					title='Banheiros'
					subtitle='Quantos banheiros você tem?'
					value={bathroomCount}
					onChange={(value) => setCustomValue('bathroomCount', value)}
				/>
				<hr />

			</div>
		);
	}

	if (step === STEPS.IMAGES) {
		bodyContent = (
			<div className='flex flex-col gap-8'>
				<Heading
					title='Adicione uma foto do seu lugar'
					subtitle='Mostre aos convidados como é o seu espaço!'
				/>
				<ImageUpload
					value={imageSrc}
					onChange={(value) => setCustomValue('imageSrc', value)}
				/>
			</div>
		);
	}
	if(step === STEPS.DESCRIPTION) {
		bodyContent = (
			<div className='flex flex-col gap-8'>
				<Heading
					title='Como você descreveria seu lugar?'
					subtitle='Curto e doce funciona melhor!'
				/>
				<Input
					id='title'
					label='Titulo da sua casa'
					disabled={isLoading}
					register={register}
					errors={errors}
					required
				/>
				<hr />

				<Input
					id='description'
					label='Descricao da sua casa'
					disabled={isLoading}
					register={register}
					errors={errors}
					required
				/>
			</div>
		);
	}

	if (step === STEPS.PRICE){
		bodyContent = (
			<div className='flex flex-col gap-8'>
				<Heading
					title='Agora, defina seu preço'
					subtitle='Quanto você cobra por noite?'
				/>

				<Input
					id='price'
					label='Price'
					formatPrice
					type='number'
					disabled={isLoading}
					register={register}
					errors={errors}
					required
				/>
			</div>
		);
	}

	return (

		<Modal
			isOpen={rentModal.isOpen}
			onClose={rentModal.onClose}
			onSubmit={handleSubmit(onSubmit)}
			actionLabel={actionLabel}
			secondaryActionLabel={secondaryActionLabel}
			secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
			title="Vou hospedar"
			body={bodyContent}
		/>
	);
};

export default RentModal;
