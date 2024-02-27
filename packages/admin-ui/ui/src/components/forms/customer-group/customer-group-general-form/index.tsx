import FormValidator from "../../../../utils/form-validator"
import { NestedForm } from "../../../../utils/nested-form"
import QuantityCell from "../../../molecules/ms-input-number"

export type CustomerGroupGeneralFormType = {
  name: string
}

type CustomerGroupGeneralFormProps = {
  form: NestedForm<CustomerGroupGeneralFormType>
}

export const CustomerGroupGeneralForm = ({
  form,
}: CustomerGroupGeneralFormProps) => {
  const {
    register,
    path,
    formState: { errors },
  } = form

  return (
    <div>
      <QuantityCell
        label="Name"
        required
        {...register(path("name"), {
          required: FormValidator.required("Name"),
        })}
        errors={errors}
      />
    </div>
  )
}
