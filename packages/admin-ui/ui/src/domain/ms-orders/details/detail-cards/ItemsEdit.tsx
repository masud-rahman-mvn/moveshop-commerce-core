import clsx from "clsx"

import { useTranslation } from "react-i18next"

import ImagePlaceholder from "../../../../components/fundamentals/image-placeholder"

import Table from "../../../../components/molecules/ms-table"
import { Order, OrderEdit } from "@medusajs/medusa"
import OrderEditLine from "../order-line/edit"
import { fieldsItems } from "./data/fieldsItem"
import { item } from "./data/item"
import { ProductVariant } from "@medusajs/client-types"
import { useContext, useEffect, useRef, useState } from "react"
import { useAdminCreateOrderEdit } from "medusa-react"
import useNotification from "../../../../hooks/use-notification"
import QuantityCell from "../../../../components/molecules/ms-quantity-cell"
import { OrderEditContext } from "../../edit/context"

type OrderEditModalProps = {
  close: () => void
  orderEdit: OrderEdit
  currencyCode: string
  regionId: string
  customerId: string
  currentSubtotal: number
  paidTotal: number
  refundedTotal: number
}

let isRequestRunningFlag = false
const ItemsEdit = (props: OrderEditModalProps) => {
  return (
    <div className="mt-6 rounded-lg border ">
      {true && (
        <Table className=" m-3">
          <Table.Head>
            <Table.HeadRow>
              <Table.HeadCell>
                {t("components-item-name", "Item Name")}
              </Table.HeadCell>
              <Table.HeadCell className=" text-center ">
                {t("components-item-price", "Item Price")}
              </Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
              <Table.HeadCell className=" text-center ">
                {t("components-quantity", "Quantity")}
              </Table.HeadCell>
              <Table.HeadCell className="text-center ">
                {t("components-total-price", "Total Price")}
              </Table.HeadCell>
            </Table.HeadRow>
          </Table.Head>
          <div className="h-3"></div>
          <Table.Body className="">
            {fieldsItems?.map((item, index) => {
              return (
                <Table.Row
                  key={item.id}
                  className={clsx("border-b-grey-0 hover:bg-grey-0")}
                >
                  <Table.Cell>
                    <div className="flex  items-center py-2">
                      <div className="h-[40px] w-[30px] ">
                        {item.thumbnail ? (
                          <img
                            className="h-full w-full rounded object-cover"
                            src={item.thumbnail}
                          />
                        ) : (
                          <ImagePlaceholder />
                        )}
                      </div>
                      <div className="inter-small-regular text-grey-50 ml-4 flex flex-col">
                        {item.product_title && (
                          <span className="text-grey-90">
                            {item.product_title}
                          </span>
                        )}
                        <span>{item.title}</span>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-center ">
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-3">
                        <span>{order?.currency_code.toLocaleUpperCase()}</span>
                        <span>{item?.unit_price}</span>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-large text-start  text-black ">
                    X
                  </Table.Cell>
                  <Table.Cell className="flex flex-col items-center text-center ">
                    <QuantityCell quantity={item?.quantity} />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-center gap-3 ">
                      <div className="flex items-center gap-3">
                        <span>{order?.currency_code.toLocaleUpperCase()}</span>
                        <span>{order?.total}</span>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <OrderEditLine
                      currencyCode="USD"
                      customerId={order?.customer_id}
                      item={item}
                    />
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      )}
    </div>
  )
}

export default ItemsEdit
