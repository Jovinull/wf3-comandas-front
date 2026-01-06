"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

type ConfirmDialogProps = Readonly<{
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  danger?: boolean;
  disabled?: boolean;
}>;

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  onConfirm,
  onCancel,
  danger,
  disabled
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-3">
        <p className="text-sm text-zinc-600">{description}</p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={disabled}>
            Cancelar
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            full
            disabled={disabled}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
