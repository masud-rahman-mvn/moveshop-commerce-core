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
import ItemsEdit from "./ItemsEdit"
import BodyCard from "../../../../components/organisms/ms-body-card"
import OrderEditContainer, { OrderEditModal } from "./order-summery"
import useNotification from "../../../../hooks/use-notification"

type SummaryCardProps = {
  order?: Order
  reservations?: ReservationItemDTO[]
}
let isRequestRunningFlag = false
const MsSummaryCard: React.FC<SummaryCardProps> = ({ order, reservations }) => {
  // const notification = useNotification()

  // const { hideModal, orderEdits, activeOrderEditId, setActiveOrderEdit } =
  //   useContext(OrderEditContext)

  // const { mutateAsync: createOrderEdit } = useAdminCreateOrderEdit()

  // const orderEdit = orderEdits?.find((oe) => oe.id === activeOrderEditId)

  // useEffect(() => {
  //   if (activeOrderEditId || isRequestRunningFlag) {
  //     return
  //   }

  //   isRequestRunningFlag = true

  //   createOrderEdit({ order_id: order?.id })
  //     .then(({ order_edit }) => setActiveOrderEdit(order_edit.id))
  //     .catch(() => {
  //       notification(
  //         "Error",
  //         "There is already an active order edit on this order",
  //         "error"
  //       )
  //       hideModal()
  //     })
  //     .finally(() => (isRequestRunningFlag = false))
  // }, [activeOrderEditId])

  // const onClose = () => {
  //   // setActiveOrderEdit(undefined) -> context will unset active edit after flag toggle
  //   hideModal()
  // }

  // if (!orderEdit) {
  //   return null
  // }
  const { t } = useTranslation()
  const {
    state: reservationModalIsOpen,
    open: showReservationModal,
    close: closeReservationModal,
  } = useToggleState()

  const { showModal } = useContext(OrderEditContext)
  const { client } = useMedusa()
  const { isFeatureEnabled } = useFeatureFlag()
  const inventoryEnabled = isFeatureEnabled("inventoryService")

  const [variantInventoryMap, setVariantInventoryMap] = React.useState<
    Map<string, VariantInventory>
  >(new Map())

  React.useEffect(() => {
    if (!inventoryEnabled) {
      return
    }

    const fetchInventory = async () => {
      const inventory = await Promise.all(
        order.items.map(async (item) => {
          if (!item.variant_id) {
            return
          }
          return await client.admin.variants.getInventory(item.variant_id)
        })
      )

      setVariantInventoryMap(
        new Map(
          inventory
            .filter(
              (
                inventoryItem
                // eslint-disable-next-line max-len
              ): inventoryItem is Response<AdminGetVariantsVariantInventoryRes> =>
                !!inventoryItem
            )
            .map((i) => {
              return [i.variant.id, i.variant]
            })
        )
      )
    }

    fetchInventory()
  }, [order.items, inventoryEnabled, client.admin.variants])

  const reservationItemsMap = useMemo(() => {
    if (!reservations?.length || !inventoryEnabled) {
      return {}
    }

    return reservations.reduce(
      (acc: Record<string, ReservationItemDTO[]>, item: ReservationItemDTO) => {
        if (!item.line_item_id) {
          return acc
        }
        acc[item.line_item_id] = acc[item.line_item_id]
          ? [...acc[item.line_item_id], item]
          : [item]
        return acc
      },
      {}
    )
  }, [reservations, inventoryEnabled])

  const allItemsReserved = useMemo(() => {
    return order.items.every((item) => {
      if (
        !item.variant_id ||
        !variantInventoryMap.get(item.variant_id)?.inventory.length
      ) {
        return true
      }

      const reservations = reservationItemsMap[item.id]

      return (
        item.quantity === item.fulfilled_quantity ||
        (reservations &&
          sum(reservations.map((r) => r.quantity)) ===
            item.quantity - (item.fulfilled_quantity || 0))
      )
    })
  }, [order.items, variantInventoryMap, reservationItemsMap])

  const { hasMovements, swapAmount, manualRefund, swapRefund, returnRefund } =
    useMemo(() => {
      let manualRefund = 0
      let swapRefund = 0
      let returnRefund = 0

      const swapAmount = sum(order?.swaps.map((s) => s.difference_due) || [0])

      if (order?.refunds?.length) {
        order.refunds.forEach((ref) => {
          if (ref.reason === "other" || ref.reason === "discount") {
            manualRefund += ref.amount
          }
          if (ref.reason === "return") {
            returnRefund += ref.amount
          }
          if (ref.reason === "swap") {
            swapRefund += ref.amount
          }
        })
      }
      return {
        hasMovements:
          swapAmount + manualRefund + swapRefund + returnRefund !== 0,
        swapAmount,
        manualRefund,
        swapRefund,
        returnRefund,
      }
    }, [order])

  const actionables = useMemo(() => {
    const actionables: ActionType[] = []
    if (isFeatureEnabled("order_editing")) {
      actionables.push({
        label: t("detail-cards-edit-order", "Edit Order"),
        onClick: showModal,
      })
    }
    if (isFeatureEnabled("inventoryService") && !allItemsReserved) {
      actionables.push({
        label: t("detail-cards-allocate", "Allocate"),
        onClick: showReservationModal,
      })
    }
    return actionables
  }, [showModal, isFeatureEnabled, showReservationModal, allItemsReserved])

  const isAllocatable = !["canceled", "archived"].includes(order.status)

  return (
    <BodyCard
      className={"my-4 h-auto min-h-0 w-full rounded-lg bg-white p-5 shadow"}
      title="Order Summary"
    >
      <ItemsEdit order={order} />
      <OrderEditContainer order={order} />
    </BodyCard>
  )
}

export default MsSummaryCard
