class ApiConfig {
  // static const String baseUrl = 'https://ipos.freelix.com.la';
  //  static const String baseUrl = 'http://localhost:3000';
  static const String baseUrl = 'http://10.0.2.2:3000';
  static const String productsUrl = '$baseUrl/api/products';
  static const String ratesUrl = '$baseUrl/api/exchange-rates';
  static const String ordersUrl = '$baseUrl/api/orders';
  static const String shopsUrl = '$baseUrl/api/shops';
  static const String categoriesUrl = '$baseUrl/api/admin/categories';
  static const String appConfigUrl = '$baseUrl/api/app-config';
  static const String receiptSettingsUrl = '$baseUrl/api/admin/receipt-settings';
}
