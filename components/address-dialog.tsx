"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onAddressAdded: () => void;
}

export function AddressDialog({
  isOpen,
  onOpenChange,
  userId,
  onAddressAdded
}: AddressDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address_line: "",
    city: "",
    postal_code: "",
    notes: "",
    is_default: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_default: checked
    }));
  };

  const resetForm = () => {
    setFormData({
      address_line: "",
      city: "",
      postal_code: "",
      notes: "",
      is_default: false
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.address_line.trim() || !formData.city.trim()) {
      toast.error("Alamat dan kota wajib diisi");
      return;
    }
    
    setLoading(true);
    
    try {
      // Jika alamat baru diatur sebagai default, update alamat lain
      if (formData.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", userId);
      }
      
      // Insert alamat baru
      const { error } = await supabase
        .from("addresses")
        .insert({
          user_id: userId,
          address_line: formData.address_line,
          city: formData.city,
          postal_code: formData.postal_code || null,
          notes: formData.notes || null,
          is_default: formData.is_default,
        });
      
      if (error) throw error;
      
      toast.success("Alamat berhasil ditambahkan");
      onOpenChange(false);
      onAddressAdded();
      resetForm();
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Gagal menambahkan alamat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Alamat Baru</DialogTitle>
          <DialogDescription>
            Tambahkan alamat untuk pickup dan delivery laundry
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="address_line">Alamat Lengkap</Label>
            <Textarea
              id="address_line"
              name="address_line"
              placeholder="Jl. Contoh No. 123, Kecamatan, Kelurahan"
              value={formData.address_line}
              onChange={handleInputChange}
              required
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              name="city"
              placeholder="Jakarta"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="postal_code">Kode Pos</Label>
            <Input
              id="postal_code"
              name="postal_code"
              placeholder="12345"
              value={formData.postal_code}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Contoh: Rumah cat putih, pagar hitam"
              value={formData.notes}
              onChange={handleInputChange}
              className="resize-none"
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="is_default" 
              checked={formData.is_default}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="is_default" className="text-sm font-normal">
              Jadikan alamat utama
            </Label>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Alamat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
