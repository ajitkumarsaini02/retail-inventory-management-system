package com.hcl.retail_inventory.services;

import org.springframework.stereotype.Service;
import com.hcl.retail_inventory.entity.Product;
import com.hcl.retail_inventory.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository){
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts(){
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id){
        return productRepository.findById(id);
    }

    public String checkProductAvailability(Long id){
        Optional<Product> prod = productRepository.findById(id);
        if(prod.isPresent()){
            return "Available";
        }
        else{
            return "Not Available";
        }
    }

    public Product createProduct(Product product){
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product productDetails) {

        Optional<Product> optionalProduct = productRepository.findById(id);

        if (optionalProduct.isPresent()) {

            Product product = optionalProduct.get();

            product.setSku(productDetails.getSku());
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setCategory(productDetails.getCategory());
            product.setBrand(productDetails.getBrand());
            product.setPrice(productDetails.getPrice());
            product.setCostPrice(productDetails.getCostPrice());
            product.setUnit(productDetails.getUnit());
            product.setStatus(productDetails.getStatus());

            Product updatedProduct = productRepository.save(product);

            return Optional.of(updatedProduct);
        }

        return Optional.empty();
    }

    public boolean deleteProduct(Long id){
        Optional<Product> optionalProduct = productRepository.findById(id);

        if(optionalProduct.isPresent()){
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
