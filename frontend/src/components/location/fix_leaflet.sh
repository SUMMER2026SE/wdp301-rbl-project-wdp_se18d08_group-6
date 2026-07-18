#!/bin/bash
cd "F:/WDP391/wdp301-rbl-project-wdp_se18d08_group-6/frontend/src/components/location"

for f in shipping-map.tsx delivery-tracker.tsx delivery-map.tsx map-preview.tsx; do
  # Fix mapRef.current.remove() inside render() function
  sed -i 's/if (mapRef.current) {/if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }/g' "$f"
  
  # Remove the original multi-line if (mapRef.current) block inside render if we can
  # Actually, safer to just replace the whole useEffect cleanup logic manually
done
