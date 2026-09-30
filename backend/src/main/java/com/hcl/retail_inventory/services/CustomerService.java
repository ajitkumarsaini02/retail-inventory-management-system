package com.hcl.retail_inventory.services;

import org.springframework.stereotype.Service;
import com.hcl.retail_inventory.entity.Customer;
import com.hcl.retail_inventory.repository.CustomerRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    public String checkCustomerAvailability(Long id) {
        Optional<Customer> customer = customerRepository.findById(id);

        if (customer.isPresent()) {
            return "Available";
        }
        else {
            return "Not Available";
        }
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Optional<Customer> updateCustomer(Long id, Customer customerDetails) {

        Optional<Customer> optionalCustomer = customerRepository.findById(id);

        if (optionalCustomer.isPresent()) {

            Customer customer = optionalCustomer.get();

            customer.setName(customerDetails.getName());
            customer.setEmail(customerDetails.getEmail());
            customer.setPhone(customerDetails.getPhone());
            customer.setAddress(customerDetails.getAddress());
            customer.setCity(customerDetails.getCity());
            customer.setState(customerDetails.getState());
            customer.setPincode(customerDetails.getPincode());
            customer.setCountry(customerDetails.getCountry());

            Customer updatedCustomer = customerRepository.save(customer);

            return Optional.of(updatedCustomer);
        }

        return Optional.empty();
    }

    public boolean deleteCustomer(Long id) {

        Optional<Customer> optionalCustomer = customerRepository.findById(id);

        if (optionalCustomer.isPresent()) {
            customerRepository.deleteById(id);
            return true;
        }

        return false;
    }
}