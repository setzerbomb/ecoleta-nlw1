import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';

import './styles.css';

import Dropzone from '../../components/Dropzone';

const logo = require('../../assets/logo.svg');

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGE {
  sigla: string;
  nome: string;
}

const CreatePoint: React.FC = () => {
  const [entidade, setEntidade] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<number>(0);
  const [items, setItems] = useState<Item[]>([]);
  const [estados, setEstados] = useState<IBGE[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [initialPositon, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    const process = async () => {
      setItems((await api.get('/items')).data || []);
    };

    process();
  }, []);

  useEffect(() => {
    const process = async () => {
      setEstados(
        (
          await axios.get<IBGE[]>(
            'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
          )
        ).data.map(({ sigla, nome }) => {
          return { sigla, nome };
        }) || []
      );
    };

    process();
  }, []);

  useEffect(() => {
    const process = async () => {
      if (selectedEstado) {
        setMunicipios(
          (
            await axios.get<IBGE[]>(
              `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/municipios?orderBy=nome`
            )
          ).data.map(({ nome }) => {
            return nome;
          }) || []
        );
      }
    };

    process();
  }, [selectedEstado]);

  const handleSelectedFU = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedEstado(e.target.value);
  };

  const handleMapClick = (e: LeafletMouseEvent) => {
    setSelectedPosition([e.latlng.lat, e.latlng.lng]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const data = new FormData();

    data.append('name', entidade);
    data.append('email', email);
    data.append('whatsapp', String(whatsapp));
    data.append('latitude', String(selectedPosition[0]));
    data.append('longitude', String(selectedPosition[1]));
    data.append('items', selectedItems.join(','));
    data.append('city', selectedMunicipio);
    data.append('uf', selectedEstado);

    if (selectedFile) {
      data.append('file', selectedFile);
    }

    const response = await api.post('/points', data);

    alert('Ponto de Alerta Criado');

    if (response.status === 200) {
      history.push('/');
    }
  };

  const handleSelectItem = (item: number) => {
    if (!selectedItems.filter((i) => i === item)[0]) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    }
  };

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form action="">
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <Dropzone
            onFileUploaded={(file) => {
              setSelectedFile(file);
            }}
          />
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEntidade(e.target.value)
              }
              value={entidade}
              type="text"
              name="name"
              id="name"
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                value={email}
                type="email"
                name="email"
                id="email"
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setWhatsapp(Number(e.target.value))
                }
                value={whatsapp}
                type="number"
                name="whatsapp"
                id="whatsapp"
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o Endereço no mapa</span>
          </legend>

          <Map
            center={initialPositon || selectedPosition}
            zoom={15}
            onClick={handleMapClick}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                value={selectedEstado}
                name="uf"
                id="uf"
                onChange={handleSelectedFU}
              >
                <option value="0">Selecione uma UF</option>
                {estados &&
                  estados.map((estado, key) => (
                    <option key={key} value={estado.sigla}>
                      {estado.nome}
                    </option>
                  ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setSelectedMunicipio(e.target.value)
                }
                value={selectedMunicipio}
                name="city"
                id="city"
              >
                <option value="0">Selecione uma Cidade</option>
                {municipios &&
                  municipios.map((municipio, key) => (
                    <option key={key} value={municipio}>
                      {municipio}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Itens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((item, key) => (
              <li
                className={selectedItems.includes(item.id) ? 'selected' : ''}
                onClick={() => handleSelectItem(item.id)}
                key={key}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button onClick={handleSubmit} type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
};

export default CreatePoint;
