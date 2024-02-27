import Button from "../../../components/fundamentals/button"
import PlusIcon from "../../../components/fundamentals/icons/plus-icon"
import QuantityCell from "../../../components/molecules/ms-input-number"
import Modal from "../../../components/molecules/modal"

type AddCustomProductModalProps = {
  openAddCustomProductModal: boolean
  setOpenAddCustomProductModal: (open: boolean) => void
}

const AddCustomProductModal = ({
  openAddCustomProductModal,
  setOpenAddCustomProductModal,
}: AddCustomProductModalProps) => {
  return (
    <>
      <Modal
        open={openAddCustomProductModal}
        handleClose={() => setOpenAddCustomProductModal(false)}
      >
        <Modal.Header
          className="h-[56px]"
          iconClass="self-center"
          handleClose={() => setOpenAddCustomProductModal(false)}
        >
          <div className="flex items-end justify-center gap-2 ">
            <PlusIcon size={20} />
            <p className="font-bold">Add custom product</p>
          </div>
        </Modal.Header>
        <Modal.Body className="p-6">
          <div className="mb-4 grid grid-cols-2 gap-6">
            <QuantityCell
              placeholder="MoveOn Sweatshirt"
              title="Title/Product Name"
              label="Title/Product Name"
            />
            <QuantityCell placeholder="50" title="Quantity" label="Quantity" />
          </div>

          <div className="grid grid-cols-12 gap-6">
            <QuantityCell
              placeholder="BDT"
              className="col-span-3"
              label="Currency"
            />
            <QuantityCell
              placeholder="50"
              title="Amount"
              className="col-span-9"
              label="Amount"
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-end !px-4">
          <div className="flex gap-4">
            <Button
              className="bg-gray-110 h-[40px]"
              variant="secondary"
              onClick={() => setOpenAddCustomProductModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-[40px]"
              variant="primary"
              onClick={() => setOpenAddCustomProductModal(false)}
            >
              Add product
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default AddCustomProductModal
