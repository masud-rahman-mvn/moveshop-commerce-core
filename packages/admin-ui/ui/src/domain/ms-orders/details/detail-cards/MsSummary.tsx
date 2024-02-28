import {
  AdminGetVariantsVariantInventoryRes,
  Order,
  VariantInventory,
} from "@medusajs/medusa"
import React, { useContext, useEffect, useMemo } from "react"
import { DisplayTotal, PaymentDetails } from "../templates"
import { useTranslation } from "react-i18next"

import { ActionType } from "../../../../components/molecules/actionables"
import Badge from "../../../../components/fundamentals/badge"

import CopyToClipboard from "../../../../components/atoms/copy-to-clipboard"
import { OrderEditContext } from "../../edit/context"
import OrderLine from "../order-line"
import { ReservationItemDTO } from "@medusajs/types"
import ReserveItemsModal from "../reservation/reserve-items-modal"
import { Response } from "@medusajs/medusa-js"
import { sum } from "lodash"
import { useAdminCreateOrderEdit, useMedusa } from "medusa-react"
import StatusIndicator from "../../../../components/fundamentals/status-indicator"
import useToggleState from "../../../../hooks/use-toggle-state"
import { useFeatureFlag } from "../../../../providers/feature-flag-provider"

import BodyCard from "../../../../components/organisms/ms-body-card"

import useNotification from "../../../../hooks/use-notification"
import OrderEditTable from "./OrderEditTable"

type SummaryCardProps = {
  order?: Order | undefined
}
let isRequestRunningFlag = false
const MsSummaryCard: React.FC<SummaryCardProps> = (props: SummaryCardProps) => {
  const { order } = props
  const notification = useNotification()

  const { hideModal, orderEdits, activeOrderEditId, setActiveOrderEdit } =
    useContext(OrderEditContext)

  const { mutateAsync: createOrderEdit } = useAdminCreateOrderEdit()
  console.log("orderEdits :>> ", orderEdits)
  console.log("order :>> ", order)
  const orderEdit = orderEdits?.find(
    (oe) => oe.id === "oe_01HQQQ7T98VMQWA4EMS5JTYM8W" // activeOrderEditId
  )

  // useEffect(() => {
  //   if (activeOrderEditId || isRequestRunningFlag) {
  //     return
  //   }

  //   isRequestRunningFlag = true

  //   createOrderEdit({ order_id: order.id })
  //     .then(({ order_edit }) => setActiveOrderEdit(order_edit.id))
  //     .catch(() => {
  //       notification(
  //         "Error",
  //         "There is already an active order edit on this order",
  //         "error"
  //       )
  //     })
  //     .finally(() => (isRequestRunningFlag = false))
  // }, [activeOrderEditId])

  const onClose = () => {
    // setActiveOrderEdit(undefined) -> context will unset active edit after flag toggle
    hideModal()
  }
  // console.log("orderEdit :>> ", orderEdit)
  // if (!orderEdit) {
  //   return null
  // }
  // console.log("order :>> ", order)
  return (
    <BodyCard
      className={"my-4 h-auto min-h-0 w-10/12 rounded-lg bg-white p-5 shadow"}
      title="Order Summary"
    >
      <OrderEditTable
        orderEdit={orderEdit}
        regionId={order?.region_id}
        customerId={order?.customer_id}
        currencyCode={order?.currency_code}
        paidTotal={order?.paid_total}
      />
    </BodyCard>
  )
}

export default MsSummaryCard
