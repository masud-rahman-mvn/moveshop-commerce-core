import { useAdminRegions } from "medusa-react"
import React, { useEffect, useMemo } from "react"
import { Controller, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { SteppedContext } from "../../../../components/molecules/modal/stepped-modal"
import { NextSelect } from "../../../../components/molecules/select/next-select"
import { useNewOrderForm } from "../form"

const SelectRegionScreen = () => {
  const { t } = useTranslation()
  const { enableNextPage, disableNextPage } = React.useContext(SteppedContext)

  const {
    form: { control },
  } = useNewOrderForm()

  const reg = useWatch({
    control,
    name: "region",
  })

  const { regions } = useAdminRegions()

  const regionOptions = useMemo(() => {
    if (!regions) {
      return []
    }

    return regions.map((region) => ({
      label: region.name,
      value: region.id,
    }))
  }, [regions])

  useEffect(() => {
    if (!reg) {
      disableNextPage()
    } else {
      enableNextPage()
    }
  }, [reg])

  // min-h-[705px]

  return (
    <div className="flex  flex-col">
      <Controller
        control={control}
        name="region"
        render={({ field: { onChange, value } }) => {
          return (
            <NextSelect
              label={t("components-region", "Region")}
              onChange={onChange}
              value={value}
              options={regionOptions}
            />
          )
        }}
      />
    </div>
  )
}

export default SelectRegionScreen
