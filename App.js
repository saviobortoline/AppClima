import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, StatusBar, ScrollView } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';

const WeatherApp = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  // Função para buscar a previsão do tempo com base na latitude e longitude
  const fetchWeather = async (lat, lon) => {
    try {
      const apiKey = 'a8cc6ed65536625c0a4acbd565fd38dc'; // Substitua pela sua chave de API
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt&appid=${apiKey}`
      );
      setWeather(response.data);
      setLoading(false);
    } catch (error) {
      console.log('Erro ao buscar a previsão do tempo.', error);
      setLoading(false);
    }
  };

  // Função para obter a localização atual do usuário
  const getLocation = async () => {
    try {
      // Solicita permissões de localização
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permissão de localização negada');
        setLoading(false);
        return;
      }

      // Obtém a localização atual
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      fetchWeather(latitude, longitude);  // Chama a função para buscar os dados com base na localização
    } catch (error) {
      console.log('Erro ao obter a localização:', error);
      setLocationError('Não foi possível obter a localização.');
      setLoading(false);
    }
  };

  // Função para converter a hora para o horário de Brasília
  const convertToBrasiliaTime = (timestamp) => {
    const date = new Date(timestamp * 1000); // Converte de Unix timestamp para Date

    // Configurações para o formato curto de data
    const options = {
      timeZone: 'America/Sao_Paulo',  // Fuso horário de Brasília
      day: '2-digit',   // Dia com 2 dígitos
      month: '2-digit', // Mês com 2 dígitos
      year: 'numeric',  // Ano com 4 dígitos
      hour: '2-digit',  // Hora com 2 dígitos
      minute: '2-digit', // Minuto com 2 dígitos
      second: '2-digit', // Segundo com 2 dígitos
      hour12: false,
    };

    return new Intl.DateTimeFormat('pt-BR', options).format(date); // Retorna data formatada como 0/00/0000
  };

  useEffect(() => {
    getLocation(); // Obtém a localização e busca o clima
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {locationError && (
        <Text style={styles.errorText}>{locationError}</Text>
      )}

      <Text style={styles.title}>
        Clima Atual : {weather ? weather.city.name : 'Carregando...'}
      </Text>

      <Text style={styles.subtitle}>
        Latitude: {weather ? weather.city.coord.lat : '--'} | Longitude: {weather ? weather.city.coord.lon : '--'}
      </Text>

      {weather && !loading ? (
        <ScrollView style={styles.scrollView}>
          {weather.list.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {convertToBrasiliaTime(item.dt)}
                </Text>

                <Text style={styles.temperatureText}>
                  {item.main.temp}°C
                </Text>
                <Image
                  source={{ uri: `http://openweathermap.org/img/wn/${item.weather[0].icon}.png` }}
                  style={styles.weatherIcon}
                />
              </View>
              <Text style={styles.cardText}>Clima: {item.weather[0].description}</Text>
              <Text style={styles.cardText}>
                Chuva: {item.pop > 0 ? (item.pop * 100).toFixed(1) + '%' : 'Sem previsão de chuva'}
              </Text>

              <Text style={styles.cardText}>Umidade: {item.main.humidity}%</Text>
              <Text style={styles.cardText}>Vento: {(item.wind.speed * 3.6).toFixed(1)} km/h</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ActivityIndicator size="large" color="#4285F4" style={styles.loadingIndicator} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff', // Cor de fundo mais suave
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    top: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5EABC8', // Cor verde para destacar o título
    textAlign: 'left',
    marginBottom: 10,
    top: 10
  },
  subtitle: {
    fontSize: 14,
    color: '#888', // Cor mais suave para subtítulos
    top: 10,
  },
  scrollView: {
    width: '100%',
  },
  card: {
    padding: 6, // Reduzido o padding para tornar o card menor
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd', // Borda verde para cards
    borderRadius: 8,
    backgroundColor: '#fff',
    width: '100%',
    maxHeight: 150, // Definido uma altura máxima para o card
    shadowColor: '#000', // Sombra suave para os cards
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    top: 25
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 14, // Diminuído o tamanho do texto para caber melhor no card
    color: '#444', // Cor mais escura para o texto do card
  },
  loadingIndicator: {
    marginTop: 20,
  },
  weatherInfo: {
    flexDirection: 'column',  // Organiza o ícone e a temperatura verticalmente
    alignItems: 'center',     // Garante o alinhamento centralizado
    marginLeft: 10,           // Espaço entre a data e os dados do clima
  },
  weatherIcon: {
    width: 30,   // Tamanho do ícone
    height: 30,  // Tamanho do ícone
    marginTop: 5,  // Espaço entre a temperatura e o ícone
  },
  temperatureText: {
    fontSize: 24,  // Tamanho da fonte da temperatura
    fontWeight: 'bold',
    color: '#000',  // Cor da temperatura
    marginLeft: '20%',   // Espaço à direita
  },
});

export default WeatherApp;
