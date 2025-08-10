import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Vehicle, InsertVehicle } from "@shared/schema";

interface AdminVehicleFormProps {
  vehicle?: Vehicle | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminVehicleForm({ vehicle, onSuccess, onCancel }: AdminVehicleFormProps) {
  const [formData, setFormData] = useState<InsertVehicle>({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    trim: vehicle?.trim || '',
    price: vehicle?.price || '0',
    mileage: vehicle?.mileage || 0,
    exteriorColor: vehicle?.exteriorColor || '',
    interiorColor: vehicle?.interiorColor || '',
    fuelType: vehicle?.fuelType || 'gasoline',
    transmission: vehicle?.transmission || '',
    drivetrain: vehicle?.drivetrain || '',
    engine: vehicle?.engine || '',
    seatingCapacity: vehicle?.seatingCapacity || 5,
    description: vehicle?.description || '',
    features: vehicle?.features || [],
    images: vehicle?.images || [],
    status: vehicle?.status || 'available',
    statusBanner: vehicle?.statusBanner || null,
    stockNumber: vehicle?.stockNumber || '',
    vin: vehicle?.vin || '',
    isFeatured: vehicle?.isFeatured || false,
  });

  const [newFeature, setNewFeature] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const vehicleMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => {
      if (vehicle) {
        return apiRequest("PUT", `https://admin-backend-lyart.vercel.app/api/auth/vehicles/${vehicle.id}`, data);
      } else {
        return apiRequest("POST", "https://admin-backend-lyart.vercel.app/api/auth/vehicles", data);
      }
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: vehicle ? "Vehicle updated successfully" : "Vehicle created successfully" 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/vehicles"] });
      onSuccess();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to save vehicle", 
        variant: "destructive" 
      });
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = (formData.features as string[])?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, features: updatedFeatures });
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    vehicleMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            value={formData.make}
            onChange={(e) => handleChange('make', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            min="1990"
            max={new Date().getFullYear() + 1}
            value={formData.year}
            onChange={(e) => handleChange('year', parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="trim">Trim</Label>
          <Input
            id="trim"
            value={formData.trim || ''}
            onChange={(e) => handleChange('trim', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="mileage">Mileage</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => handleChange('mileage', parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="exteriorColor">Exterior Color</Label>
          <Input
            id="exteriorColor"
            value={formData.exteriorColor}
            onChange={(e) => handleChange('exteriorColor', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="interiorColor">Interior Color</Label>
          <Input
            id="interiorColor"
            value={formData.interiorColor || ''}
            onChange={(e) => handleChange('interiorColor', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="fuelType">Fuel Type</Label>
          <Select value={formData.fuelType} onValueChange={(value) => handleChange('fuelType', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasoline">Gasoline</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="transmission">Transmission</Label>
          <Input
            id="transmission"
            value={formData.transmission}
            onChange={(e) => handleChange('transmission', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="drivetrain">Drivetrain</Label>
          <Select value={formData.drivetrain || "fwd"} onValueChange={(value) => handleChange('drivetrain', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fwd">FWD</SelectItem>
              <SelectItem value="rwd">RWD</SelectItem>
              <SelectItem value="awd">AWD</SelectItem>
              <SelectItem value="4wd">4WD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="engine">Engine</Label>
          <Input
            id="engine"
            value={formData.engine || ''}
            onChange={(e) => handleChange('engine', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="seatingCapacity">Seating Capacity</Label>
          <Input
            id="seatingCapacity"
            type="number"
            min="1"
            max="8"
            value={formData.seatingCapacity || ''}
            onChange={(e) => handleChange('seatingCapacity', parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="stockNumber">Stock Number</Label>
          <Input
            id="stockNumber"
            value={formData.stockNumber || ''}
            onChange={(e) => handleChange('stockNumber', e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="vin" className="text-lg font-semibold text-trex-green">VIN Number</Label>
          <Input
            id="vin"
            value={formData.vin || ''}
            onChange={(e) => handleChange('vin', e.target.value)}
            placeholder="Enter 17-character VIN"
            className="font-mono text-lg border-2 border-trex-green/30 focus:border-trex-green"
            maxLength={17}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="statusBanner">Status Banner (Optional)</Label>
          <Select value={formData.statusBanner || "none"} onValueChange={(value) => handleChange('statusBanner', value === "none" ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status banner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Banner</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="low-miles">Low Miles</SelectItem>
              <SelectItem value="local-trade">Local Trade In</SelectItem>
              <SelectItem value="just-reduced">Just Reduced</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter vehicle description..."
        />
      </div>

      {/* Features */}
      <div>
        <Label>Features</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature..."
            />
            <Button type="button" onClick={handleAddFeature} variant="outline">
              Add
            </Button>
          </div>
          <div className="space-y-1">
            {formData.features?.map((feature, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{feature as string}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFeature(index)}
                  className="text-red-600"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image URLs */}
      <div>
        <Label className="text-lg font-semibold">Vehicle Images</Label>
        <div className="space-y-4">
          {/* Local File Upload */}
          <div>
            <Label className="text-sm text-gray-600">Upload Images from Computer</Label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full p-2 border rounded text-sm"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  // Convert files to data URLs for preview
                  const currentImages = (formData.images as string[]) || [];
                  
                  files.forEach((file, index) => {
                    if (currentImages.length + index < 10) { // Limit to 10 total images
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result as string;
                        const currentImages = (formData.images as string[]) || [];
                        const newImages = [...currentImages, dataUrl].slice(0, 10);
                        handleChange('images', newImages);
                      };
                      reader.readAsDataURL(file);
                    }
                  });
                  
                  // Clear the input
                  e.target.value = '';
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Select multiple image files from your computer (JPG, PNG, etc.). Maximum 10 images total per vehicle.
            </p>
          </div>

          {/* Bulk Image URL Input */}
          <div>
            <Label className="text-sm text-gray-600">Or paste Google Drive URLs (one per line)</Label>
            <div className="space-y-2">
              <textarea
                className="w-full h-32 p-3 border rounded text-sm font-mono resize-none"
                placeholder={`Paste your Google Drive image URLs here, one per line (up to 10):

https://drive.google.com/file/d/FILE_ID_1/view
https://drive.google.com/file/d/FILE_ID_2/view
https://drive.google.com/uc?export=view&id=FILE_ID_3

Press Enter after each URL to add it as a separate image...`}
                value={(formData.images as string[] || []).join('\n')}
                onChange={(e) => {
                  const textValue = e.target.value;
                  console.log('Textarea raw value:', JSON.stringify(textValue));
                  const lines = textValue.split('\n');
                  console.log('Lines found:', lines);
                  
                  // Process URLs and convert Google Drive sharing links to direct image URLs
                  const rawUrls = lines
                    .map(url => url.trim())
                    .filter(url => url.length > 0 && url.startsWith('http'));
                
                // Convert Google Drive sharing links to direct image URLs
                const processedUrls = rawUrls.map(url => {
                  // Handle multiple Google Drive URL formats:
                  // 1. https://drive.google.com/file/d/FILE_ID/view
                  // 2. https://drive.google.com/file/d/FILE_ID/view?usp=sharing
                  // 3. https://drive.google.com/open?id=FILE_ID
                  // 4. Already converted: https://drive.google.com/uc?export=view&id=FILE_ID
                  
                  let driveFileId = null;
                  
                  // Method 1: /file/d/FILE_ID pattern
                  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
                  if (fileMatch) {
                    driveFileId = fileMatch[1];
                  }
                  
                  // Method 2: open?id=FILE_ID pattern  
                  const openMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
                  if (openMatch && !driveFileId) {
                    driveFileId = openMatch[1];
                  }
                  
                  // Method 3: uc?export=view&id=FILE_ID (already converted)
                  const ucMatch = url.match(/uc\?export=view&id=([a-zA-Z0-9-_]+)/);
                  if (ucMatch) {
                    return url; // Already in correct format
                  }
                  
                  // Convert to direct image URL if we found a file ID
                  if (driveFileId) {
                    console.log('Converting Google Drive URL:', url, 'to ID:', driveFileId);
                    // Use the more reliable Google Drive image URL format
                    return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w800-h600`;
                  }
                  
                  // Return as-is if not a Google Drive URL
                  return url;
                }).slice(0, 10); // Limit to 10 images
                
                console.log('Processed URLs:', processedUrls);
                handleChange('images', processedUrls);
              }}
              />
              
              {/* Quick Add URL Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded text-sm"
                  placeholder="Or paste one URL here and click Add..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      const url = input.value.trim();
                      if (url && url.startsWith('http')) {
                        const currentImages = (formData.images as string[]) || [];
                        if (currentImages.length < 10) {
                          // Convert Google Drive URL if needed
                          let processedUrl = url;
                          const driveFileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1] || url.match(/[?&]id=([a-zA-Z0-9-_]+)/)?.[1];
                          if (driveFileId) {
                            processedUrl = `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w800-h600`;
                          }
                          
                          handleChange('images', [...currentImages, processedUrl]);
                          input.value = '';
                        }
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                    const url = input.value.trim();
                    if (url && url.startsWith('http')) {
                      const currentImages = (formData.images as string[]) || [];
                      if (currentImages.length < 10) {
                        // Convert Google Drive URL if needed
                        let processedUrl = url;
                        const driveFileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1] || url.match(/[?&]id=([a-zA-Z0-9-_]+)/)?.[1];
                        if (driveFileId) {
                          processedUrl = `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w800-h600`;
                        }
                        
                        handleChange('images', [...currentImages, processedUrl]);
                        input.value = '';
                      }
                    }
                  }}
                >
                  Add URL
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p>
                <strong>Google Drive Setup:</strong> Right-click image → Share → "Anyone with the link" → Copy link. 
                Paste sharing links (they'll be converted automatically). Press Enter for new line. Maximum 10 images per vehicle.
              </p>
              <p className="text-xs text-blue-600">
                <strong>Test multiline:</strong> Type any http URL, press Enter, type another URL - you should see each as a separate image
              </p>
              <p>
                <strong>Supported formats:</strong> drive.google.com/file/d/FILE_ID/view, drive.google.com/open?id=FILE_ID, or direct image URLs
              </p>
              <p className="text-xs text-green-600">
                Current URLs detected: {(formData.images as string[] || []).length}
              </p>
            </div>
          </div>
          
          {/* Image Preview */}
          {formData.images && formData.images.length > 0 && (
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm text-gray-600">
                    Image Preview ({formData.images.length}/10) 
                    {formData.images.length >= 10 && <span className="text-orange-600 ml-1">(Maximum reached)</span>}
                  </Label>
                  <p className="text-xs text-blue-600 mt-1">
                    ✨ <strong>New:</strong> Drag and drop images to reorder them! The first image (★) will be the featured image on your website.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChange('images', [])}
                  className="text-xs"
                >
                  Clear All Images
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {formData.images.map((image, index) => {
                  const imageUrl = image as string;
                  console.log(`Rendering image ${index + 1}:`, imageUrl);
                  
                  return (
                    <div 
                      key={index} 
                      className="relative group cursor-move"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', index.toString());
                        e.currentTarget.classList.add('opacity-50');
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.classList.remove('opacity-50');
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-trex-green', 'border-4');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-trex-green', 'border-4');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-trex-green', 'border-4');
                        
                        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        const hoverIndex = index;
                        
                        if (dragIndex === hoverIndex) return;
                        
                        const images = [...(formData.images as string[])];
                        const draggedImage = images[dragIndex];
                        
                        // Remove dragged image from its original position
                        images.splice(dragIndex, 1);
                        // Insert it at the new position
                        images.splice(hoverIndex, 0, draggedImage);
                        
                        handleChange('images', images);
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={`Vehicle image ${index + 1}`}
                        className="w-full h-24 object-cover rounded border-2 border-gray-200 group-hover:border-trex-green transition-colors"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onLoad={() => console.log(`Image ${index + 1} loaded successfully:`, imageUrl)}
                        onError={(e) => {
                          console.error(`Image ${index + 1} failed to load:`, imageUrl);
                          // Try alternative Google Drive format if original fails
                          if (imageUrl.includes('drive.google.com/thumbnail?id=')) {
                            const fileId = imageUrl.match(/id=([a-zA-Z0-9-_]+)/)?.[1];
                            if (fileId) {
                              const altUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
                              console.log(`Trying alternative URL:`, altUrl);
                              (e.target as HTMLImageElement).src = altUrl;
                              return;
                            }
                          }
                          // Fallback to placeholder
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNSAxMi0zLTMtMy4wMDEgM20xLjUtMi41YTEuNSAxLjUgMCAxIDEgMC0zIDEuNSAxLjUgMCAwIDEgMCAzem0tNi0yaDEwdjhoLTEweiIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgo8L3N2Zz4K';
                        }}
                      />
                      <div className="absolute top-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded flex items-center gap-1">
                        {index === 0 && <span className="text-yellow-300">★</span>}
                        {index + 1}
                      </div>
                      <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ⋮⋮
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {imageUrl.length > 30 ? `${imageUrl.substring(0, 30)}...` : imageUrl}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                        onClick={() => {
                          const updatedImages = (formData.images as string[])?.filter((_, i) => i !== index) || [];
                          handleChange('images', updatedImages);
                        }}
                        title="Remove image"
                      >
                        ×
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Featured Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isFeatured"
          checked={formData.isFeatured || false}
          onCheckedChange={(checked) => handleChange('isFeatured', !!checked)}
        />
        <Label htmlFor="isFeatured">Featured Vehicle</Label>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-trex-green hover:bg-trex-green text-white"
          disabled={vehicleMutation.isPending}
        >
          {vehicleMutation.isPending 
            ? (vehicle ? "Updating..." : "Creating...") 
            : (vehicle ? "Update Vehicle" : "Create Vehicle")
          }
        </Button>
      </div>
    </form>
  );
}
