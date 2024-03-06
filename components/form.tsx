'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

import { z } from 'zod'
import { FormDataSchema } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler } from 'react-hook-form'

type Inputs = z.infer<typeof FormDataSchema>

const steps = [
  {
    id: 'Step 1',
    name: 'User Information',
    fields: [
      'firstName',
      'lastName',
      'email',
      'parentnames',
      'phonenumber',
      'address'
    ]
  },
  {
    id: 'Step 2',
    name: 'Add Family Members',
    fields: ['membername', 'memberrelation']
  },
  { id: 'Step 3', name: 'Complete' }
]

export default function Form() {
  const [previousStep, setPreviousStep] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const delta = currentStep - previousStep

  const {
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema)
  })

  const [submittedData, setSubmittedData] = useState<Inputs | null>(null)

  const processForm: SubmitHandler<Inputs> = data => {
    console.log(data)
    setSubmittedData(data)
    reset()
  }

  type FieldName = keyof Inputs

  const next = async () => {
    const fields = steps[currentStep].fields
    const output = await trigger(fields as FieldName[], { shouldFocus: true })

    if (!output) return

    if (currentStep === 1) {
      const latestIndex =
      familyMembers.length > 0
        ? familyMembers[familyMembers.length - 1].index
        : 0

      const memberNameField = `membername-${latestIndex}` as keyof Inputs
      const memberRelationField =
        `memberrelation-${latestIndex}` as keyof Inputs

      const memberNameValue = watch(memberNameField)
      const memberRelationValue = watch(memberRelationField)

      // If any field is blank, display error messages and prevent adding a new member
      if (!memberNameValue || !memberRelationValue) {
        // Display error messages for current member fields
        const currentMemberErrors = {
          memberName: !memberNameValue ? 'Please enter member name.' : '',
          memberRelation: !memberRelationValue
            ? 'Please enter member relation.'
            : ''
        }

        // Update the errors for the current member
        setFamilyMembers(prevMembers => {
          const updatedMembers = prevMembers.map(member => {
            if (member.index === latestIndex) {
              return { ...member, errors: currentMemberErrors }
            }
            return member
          })
          return updatedMembers
        })

        return
      }
    }

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await handleSubmit(processForm)()
      }
      setPreviousStep(currentStep)
      setCurrentStep(step => step + 1)
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep)
      setCurrentStep(step => step - 1)
    }
  }

  const [familyMembers, setFamilyMembers] = useState([
    { index: 1, isOpen: true, errors: { memberName: '', memberRelation: '' } }
  ])

  const addFamilyMember = () => {
    const latestIndex =
      familyMembers.length > 0
        ? familyMembers[familyMembers.length - 1].index
        : 0

    const memberNameField = `membername-${latestIndex}` as keyof Inputs
    const memberRelationField = `memberrelation-${latestIndex}` as keyof Inputs

    const memberNameValue = watch(memberNameField)
    const memberRelationValue = watch(memberRelationField)

    // If any field is blank, display error messages and prevent adding a new member
    if (!memberNameValue || !memberRelationValue) {
      // Display error messages for current member fields
      const currentMemberErrors = {
        memberName: !memberNameValue ? 'Please enter member name.' : '',
        memberRelation: !memberRelationValue
          ? 'Please enter member relation.'
          : ''
      }

      // Update the errors for the current member
      setFamilyMembers(prevMembers => {
        const updatedMembers = prevMembers.map(member => {
          if (member.index === latestIndex) {
            return { ...member, errors: currentMemberErrors }
          }
          return member
        })
        return updatedMembers
      })

      return
    }

    // If all fields are filled, proceed to add the new member with empty errors
    setFamilyMembers(prevMembers => [
      ...prevMembers,
      {
        index: latestIndex + 1,
        isOpen: true,
        errors: { memberName: '', memberRelation: '' }
      }
    ])
  }

  const removeFamilyMember = (index: number) => {
    const updatedMembers = familyMembers.filter((_, idx) => idx !== index)
    setFamilyMembers(updatedMembers)
  }

  return (
    <section className='absolute inset-0 flex flex-col justify-between p-24'>
      {/* steps */}
      <nav aria-label='Progress'>
        <ol role='list' className='space-y-4 md:flex md:space-x-8 md:space-y-0'>
          {steps.map((step, index) => (
            <li key={step.name} className='md:flex-1'>
              {currentStep > index ? (
                <div className='group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-sky-600 transition-colors '>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className='flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'
                  aria-current='step'
                >
                  <span className='text-sm font-medium text-sky-600'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              ) : (
                <div className='group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-gray-500 transition-colors'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form */}
      <form className='mt-12 py-12' onSubmit={handleSubmit(processForm)}>
        {currentStep === 0 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h2 className='text-base font-semibold leading-7 text-gray-900'>
              User Information
            </h2>
            <p className='mt-1 text-sm leading-6 text-gray-600'>
              Please Provide your details here.
            </p>
            <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
              <div className='sm:col-span-3'>
                <label
                  htmlFor='firstName'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  First name
                </label>
                <div className='mt-2'>
                  <input
                    type='text'
                    id='firstName'
                    {...register('firstName')}
                    autoComplete='given-name'
                    className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6'
                  />
                  {errors.firstName?.message && (
                    <p className='mt-2 text-sm text-red-400'>
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='sm:col-span-3'>
                <label
                  htmlFor='lastName'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Last name
                </label>
                <div className='mt-2'>
                  <input
                    type='text'
                    id='lastName'
                    {...register('lastName')}
                    autoComplete='family-name'
                    className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6'
                  />
                  {errors.lastName?.message && (
                    <p className='mt-2 text-sm text-red-400'>
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='sm:col-span-3'>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Email address
                </label>
                <div className='mt-2'>
                  <input
                    id='email'
                    type='email'
                    {...register('email')}
                    autoComplete='email'
                    className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6'
                  />
                  {errors.email?.message && (
                    <p className='mt-2 text-sm text-red-400'>
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='sm:col-span-3'>
                <label
                  htmlFor='phonenumber'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Phone Number
                </label>
                <div className='mt-2'>
                  <input
                    id='phonenumber'
                    type='tel'
                    {...register('phonenumber')}
                    autoComplete='tel'
                    className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6'
                  />
                  {errors.phonenumber?.message && (
                    <p className='mt-2 text-sm text-red-400'>
                      {errors.phonenumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='sm:col-span-6'>
                <label
                  htmlFor='parentnames'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Parent Names
                </label>
                <div className='mt-2'>
                  <input
                    id='parentnames'
                    type='text'
                    {...register('parentnames')}
                    autoComplete='parentnames'
                    className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6'
                  />
                  {errors.parentnames?.message && (
                    <p className='mt-2 text-sm text-red-400'>
                      {errors.parentnames.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='sm:col-span-6'>
                <label
                  htmlFor='address'
                  className='block text-sm font-medium leading-6 text-gray-900'
                >
                  Address
                </label>
                <div className='mt-2'>
                  <input
                    id='address'
                    type='text'
                    {...register('address')}
                    autoComplete='address'
                    className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6'
                  />
                  {errors.address?.message && (
                    <p className='mt-2 text-sm text-red-400'>
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h2 className='text-base font-semibold leading-7 text-gray-900'>
              Add Family Member
            </h2>
            <p className='mt-1 text-sm leading-6 text-gray-600'>
              Please add family members below
            </p>

            {/* Existing form fields */}
            {familyMembers.map((member, index) => (
              <div key={index}>
                {/* Collapsible family member form */}
                <motion.div
                  initial={{ height: member.isOpen ? 'auto' : 0 }}
                  animate={{ height: member.isOpen ? 'auto' : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'>
                    <div className='sm:col-span-3'>
                      <label
                        htmlFor={`membername-${member.index}`}
                        className='block text-sm font-medium leading-6 text-gray-900'
                      >
                        Member Name
                      </label>
                      <div className='mt-2'>
                        <input
                          id={`membername-${member.index}`}
                          type='text'
                          {...register(
                            `membername-${member.index}` as keyof Inputs
                          )}
                          autoComplete={`membername-${member.index}`}
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6 ${errors[`membername-${member.index}` as keyof Inputs] && 'border-red-500'}`}
                        />
                        {member.errors.memberName && (
                          <p className='mt-2 text-sm text-red-400'>
                            {member.errors.memberName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='sm:col-span-3'>
                      <label
                        htmlFor={`memberrelation-${member.index}`}
                        className='block text-sm font-medium leading-6 text-gray-900'
                      >
                        Member Relation
                      </label>
                      <div className='mt-2'>
                        <input
                          id={`memberrelation-${member.index}`}
                          type='text'
                          {...register(
                            `memberrelation-${member.index}` as keyof Inputs
                          )}
                          autoComplete={`memberrelation-${member.index}`}
                          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6 ${errors[`memberrelation-${member.index}` as keyof Inputs] && 'border-red-500'}`}
                        />
                        {member.errors.memberRelation && (
                          <p className='mt-2 text-sm text-red-400'>
                            {member.errors.memberRelation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
                {/* Button to remove the family member form */}
                {familyMembers.length > 1 && (
                  <button
                    className='mt-4 rounded bg-white px-2 py-1 text-sm font-semibold text-red-500 shadow-sm ring-1 ring-inset ring-red-500 hover:bg-sky-50'
                    onClick={() => removeFamilyMember(index)}
                  >
                    Remove Member
                  </button>
                )}
              </div>
            ))}

            {/* Button to add more family members */}
            <button
              className='mt-4 rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50'
              onClick={addFamilyMember}
            >
              Add More Family Member
            </button>
          </motion.div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className='rounded bg-green-200 p-2 text-xl font-bold leading-7 text-green-900'>
              Complete
            </h2>
            <p className='mt-1 text-sm leading-6 text-gray-600'>
              Thank you for your submission.
            </p>

            {/* Display the details filled in the first step */}
            <div>
              <h3 className='mt-4 text-lg font-semibold'>User Information</h3>
              {/* Display user information */}
              <p className='mt-2 text-sm text-gray-600'>
                First Name: {submittedData?.firstName}
              </p>
              <p className='mt-2 text-sm text-gray-600'>
                Last Name: {submittedData?.lastName}
              </p>
              <p className='mt-2 text-sm text-gray-600'>
                Email: {submittedData?.email}
              </p>
              <p className='mt-2 text-sm text-gray-600'>
                Phone Number: {submittedData?.phonenumber}
              </p>
              <p className='mt-2 text-sm text-gray-600'>
                Parent Names: {submittedData?.parentnames}
              </p>
              <p className='mt-2 text-sm text-gray-600'>
                Address: {submittedData?.address}
              </p>
            </div>

            {/* Display the added family members */}
            <div className='mt-8'>
              <h3 className='mt-4 text-lg font-semibold'>Family Members</h3>
              {familyMembers.map((member, index) => (
                <div key={index}>
                  <p className='mt-2 text-sm text-gray-600'>
                    Member {index + 1} Name:{' '}
                    {watch(`membername-${member.index}` as keyof Inputs)}
                  </p>
                  <p className='mt-2 text-sm text-gray-600'>
                    Member {index + 1} Relation:{' '}
                    {watch(`memberrelation-${member.index}` as keyof Inputs)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Navigation */}
      <div className='mt-8 pt-5'>
        <div className='flex justify-between'>
          <button
            type='button'
            onClick={prev}
            disabled={currentStep === 0}
            className='rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 19.5L8.25 12l7.5-7.5'
              />
            </svg>
          </button>
          <button
            type='button'
            onClick={next}
            disabled={currentStep === steps.length - 1}
            className='rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M8.25 4.5l7.5 7.5-7.5 7.5'
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
