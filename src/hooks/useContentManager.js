import { useState, useCallback, useMemo } from "react";

import _ from "lodash";
import * as Yup from "yup";

import { axiosPrivate } from "~/_api";
import config from "~/constants/endpoints.json";
import { useGlobalSetting } from "~/contexts/GlobalSettingProvider";

const currentConfig = import.meta.env.MODE === "development" ? config.test : config.prod;

const pageConfigInitial = {
  pageType: "",
  name: "",
  headerText: "",
  pageUrl: "",
  parent: "",
  description: "",
  language: "",
  headerImage: "",
  orderNumber: 0
};

const schema = Yup.object().shape({
  pageType: Yup.string().required("Page Type is required"),
  name: Yup.string().required("name is required"),
  headerText: Yup.string().required("Header text is required "),
  parent: Yup.string().required("parent is required"),
  description: Yup.string().required("description is required"),
  language: Yup.string().required("language is required"),
  headerImage: Yup.array(),
  orderNumber: Yup.number(),
  pageUrl: Yup.string(),
  id: Yup.string()
});
const contentInitial = {
  type: "",
  title: "",
  language: "",
  contentCategory: "",
  backgroundImage: [],
  mediaContent: "",
  contentIsOriginal: false,
  autoTranslate: false,
  description: "",
  contentText: ""
};
const schemaContent = Yup.object().shape({
  type: Yup.string().required("Type is required"),
  title: Yup.string().required("Title is required"),
  language: Yup.string().required("Language is required"),
  contentCategory: Yup.string().required("Content Category is required"),
  mediaContent: Yup.string(),
  contentIsOriginal: Yup.bool(),
  autoTranslate: Yup.bool(),
  backgroundImage: Yup.array(),
  description: Yup.string(),
  contentText: Yup.string(),
  id: Yup.string()
});
const useContentManager = () => {
  const [pageConfig, setPageConfig] = useState(pageConfigInitial);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(1);
  const { setting } = useGlobalSetting();
  const [modalOpenAdd, setModalOpenAdd] = useState(false);
  const { labels } = setting;
  const [pageDialogTitle, setPageDialogTitle] = useState("");
  const [content, setContent] = useState(contentInitial);
  const [contentError, setContentError] = useState({});

  const validateField = useCallback((name, value) => {
    schema
      .validateAt(name, { [name]: value })
      .then(() => {
        setErrors((prevErrors) => {
          return {
            ...prevErrors,
            [name]: ""
          };
        });
      })
      .catch((error) => {
        setErrors((prevErrors) => {
          return {
            ...prevErrors,
            [name]: error.message
          };
        });
      });
  }, []);
  const validateFieldContent = useCallback((name, value) => {
    schemaContent
      .validateAt(name, { [name]: value })
      .then(() => {
        setContentError((prevErrors) => {
          return {
            ...prevErrors,
            [name]: ""
          };
        });
      })
      .catch((error) => {
        setContentError((prevErrors) => {
          return {
            ...prevErrors,
            [name]: error.message
          };
        });
      });
  }, []);

  const validateObject = useCallback((formData) => {
    return new Promise((resolve, reject) => {
      schema
        .validate(formData, { abortEarly: false })
        .then(() => {
          console.log("infor >> :Validation succeeded.");
          setErrors({});
          resolve();
        })
        .catch((error) => {
          console.log("Error >> :Validation failed.");
          const formattedErrors = error.inner.reduce((acc, err) => {
            return {
              ...acc,
              [err.path]: err.message
            };
          }, {});
          setErrors(formattedErrors);
          reject(formattedErrors);
        });
    });
  }, []);

  const validateObjectContent = useCallback((formData) => {
    return new Promise((resolve, reject) => {
      schemaContent
        .validate(formData, { abortEarly: false })
        .then(() => {
          console.log("infor >> :Validation succeeded.");
          setContentError({});
          resolve();
        })
        .catch((error) => {
          console.log("Error >> :Validation failed.");
          const formattedErrors = error.inner.reduce((acc, err) => {
            return {
              ...acc,
              [err.path]: err.message
            };
          }, {});
          setContentError(formattedErrors);
          reject(formattedErrors);
        });
    });
  }, []);

  const handleChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      setPageConfig((prevPageConfig) => {
        return {
          ...prevPageConfig,
          [name]: value
        };
      });
      validateField(name, value);
    },
    [validateField, setPageConfig]
  );
  const handleContentChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      setPageConfig((prevPageConfig) => {
        return {
          ...prevPageConfig,
          [name]: value
        };
      });
      validateFieldContent(name, value);
    },
    [validateFieldContent]
  );
  const savePageConfig = useCallback(() => {
    const data = {
      page_type: pageConfig.pageType,
      name: pageConfig.name,
      description: pageConfig.description,
      parent: pageConfig.parent,
      header_img: pageConfig.headerImage,
      language: pageConfig.language,
      header_text: pageConfig.headerText,
      page_url: pageConfig.pageUrl,
      seq_no: Number(pageConfig.orderNumber)
    };

    validateObject(pageConfig)
      .then(() => {
        return axiosPrivate.post(`/api/protected/${currentConfig.pageConfig}`, data);
      })
      .then(({ data }) => {
        console.log("saved succefylly ", data);
      })
      .catch((err) => {
        console.error("error :>> ", err);
      });
  }, [pageConfig, validateObject]);

  const saveContent = useCallback(() => {
    validateObjectContent(content)
      .then(() => {
        const data = {
          type: content.type,
          title: content.title,
          language: content.language,
          content_category: content.contentCategory,
          background_image: content.backgroundImage,
          media_content: content.mediaContent,
          content_is_original: content.contentIsOriginal,
          auto_translate: content.autoTranslate,
          description: content.description,
          content_text: content.contentText
        };
        return axiosPrivate.post(`/api/protected/${currentConfig.contents}`, data);
      })
      .then(({ data }) => {
        console.log("saved succefylly ", data);
      })
      .catch((err) => {
        console.error("error :>> ", err);
      });
  }, [content, validateObjectContent]);

  const handleTabChange = useCallback(
    (event, newValue) => {
      setActiveTab(newValue);
    },
    [setActiveTab]
  );

  const handleAddModalOpen = useCallback((title) => {
    setPageDialogTitle(title);
    setModalOpenAdd(() => true);
  }, []);
  const handleAddModalClose = useCallback(() => {
    setModalOpenAdd(false);
    setPageConfig(pageConfigInitial);
    setErrors({});
  }, [setModalOpenAdd, setPageConfig]);

  const updatePageConfig = useCallback(() => {
    validateObject(pageConfig)
      .then(() => {
        const data = {
          id: pageConfig?.id,
          page_type: pageConfig.pageType,
          name: pageConfig.name,
          description: pageConfig.description,
          parent: pageConfig.parent,
          header_img: pageConfig.headerImage,
          language: pageConfig.language,
          header_text: pageConfig.headerText,
          page_url: pageConfig.pageUrl,
          seq_no: pageConfig.orderNumber
        };
        return axiosPrivate.put(`/api/protected/${currentConfig.pageConfig}`, data);
      })
      .then(({ data }) => {
        console.log("saved succefylly ", data);
      })
      .catch((err) => {
        console.error("error :>> ", err);
      });
    setPageConfig(pageConfigInitial);
  }, [validateObject, pageConfig]);
  const updateContent = useCallback(() => {
    validateObjectContent(content)
      .then(() => {
        const data = {
          id: content.id,
          type: content.type,
          title: content.title,
          language: content.language,
          content_category: content.contentCategory,
          background_image: content.backgroundImage,
          media_content: content.mediaContent,
          content_is_original: content.contentIsOriginal,
          auto_translate: content.autoTranslate,
          description: content.description,
          content_text: content.contentText
        };
        return axiosPrivate.put(`/api/protected/${currentConfig.pageConfig}`, data);
      })
      .then(({ data }) => {
        console.log("saved succefylly ", data);
      })
      .catch((err) => {
        console.error("error :>> ", err);
      });
    setPageConfig(pageConfigInitial);
  }, [validateObjectContent, content]);
  const populatePageConfigForm = useCallback(
    (row) => {
      const { id } = row.original;
      axiosPrivate
        .get(`/api/protected/${currentConfig.pageConfig}`, {
          params: {
            id
          }
        })
        .then(({ data }) => {
          const pageConfigTemp = {
            id: data.id,
            pageType: data.page_type,
            parent: data.parent,
            headerText: data.header_text,
            language: data.language,
            imageLink: data.img_link,
            headerImage: data.header_image,
            orderNumber: data.order_number,
            description: data.description,
            name: data.name
          };
          setPageConfig((prevPageConfig) => {
            return {
              ...prevPageConfig,
              ...pageConfigTemp
            };
          });
          handleAddModalOpen("Update Page Config");
        })
        .catch((error) => {
          console.log("Error : >> ", error);
        });
    },
    [handleAddModalOpen]
  );
  const populateContentForm = useCallback(
    (row) => {
      const { id } = row.original;
      axiosPrivate
        .get(`/api/protected/${currentConfig.contents}`, {
          params: {
            id
          }
        })
        .then(({ data }) => {
          const contentTemp = {
            id: data.id,
            type: data.type,
            title: data.title,
            language: data.language,
            contentCategory: data.content_category,
            backgroundImage: data.background_image,
            mediaContent: data.media_content,
            contentIsOriginal: data.content_is_original,
            autoTranslate: data.auto_translate,
            description: data.description,
            contentText: data.content_text
          };

          setContent((prevContent) => {
            return {
              ...prevContent,
              ...contentTemp
            };
          });
          handleAddModalOpen("Update Page Config");
        })
        .catch((error) => {
          console.log("Error : >> ", error);
        });
    },
    [handleAddModalOpen]
  );

  const deletePageConfig = useCallback((row) => {
    const { id } = row.original;
    axiosPrivate
      .delete(`/api/protected/${currentConfig.pageConfig}`, {
        params: {
          id
        }
      })
      .then(({ data }) => {
        console.log("data deleted :>> ", data.id);
      })
      .catch((err) => {
        console.error("error :>> ", err);
      });
  }, []);
  const deleteContent = useCallback((row) => {
    const { id } = row.original;
    axiosPrivate
      .delete(`/api/protected/${currentConfig.contents}`, {
        params: {
          id
        }
      })
      .then(({ data }) => {
        console.log("data deleted :>> ", data.id);
      })
      .catch((err) => {
        console.error("error :>> ", err);
      });
  }, []);
  const addImageSelectionInPageConfig = (selectionButtonName, imageList) => {
    setPageConfig((prevPageConfig) => {
      return {
        ...prevPageConfig,
        [selectionButtonName]: imageList
      };
    });
  };
  const addImageSelectionContent = (selectionButtonName, imageList) => {
    setContent((prevContent) => {
      return {
        ...prevContent,
        [selectionButtonName]: imageList
      };
    });
  };
  const pageConfigFormProps = useMemo(() => {
    return {
      pageConfig: _.cloneDeep(pageConfig),
      handleChange,
      addImageSelectionInPageConfig,
      errors: _.cloneDeep(errors)
    };
  }, [errors, handleChange, pageConfig]);
  const contentFormProps = useMemo(() => {
    return {
      content: _.cloneDeep(content),
      handleContentChange,
      addImageSelectionContent,
      errors: _.cloneDeep(contentError)
    };
  }, [content, contentError, handleContentChange]);
  const dialogFormProps = useMemo(() => {
    return {
      0: {
        dialogProps: { ...pageConfigFormProps, pageConfig: _.cloneDeep(pageConfig) },
        actionHandler: pageConfig.id ? updatePageConfig : savePageConfig,
        dialogHeader: pageDialogTitle,
        actionLabel: pageDialogTitle.startsWith("Add") ? "Add" : "Save"
      },
      1: {
        dialogProps: { ...contentFormProps, content: _.cloneDeep(content) },
        actionHandler: content.id ? updateContent : saveContent,
        dialogHeader: " Add Content",
        actionLabel: "Post"
      },
      2: { dialogProps: {}, actionHandler: () => {}, dialogHeader: " Add Document", actionLabel: "Save" }
    };
  }, [
    pageConfigFormProps,
    pageConfig,
    updatePageConfig,
    savePageConfig,
    pageDialogTitle,
    contentFormProps,
    content,
    updateContent,
    saveContent
  ]);

  return {
    activeTab,
    handleTabChange,
    currentDialogFormProps: dialogFormProps[activeTab],
    labels,
    populatePageConfigForm,
    deletePageConfig,
    updatePageConfig,
    modalOpenAdd,
    handleAddModalClose,
    handleAddModalOpen,
    pageConfig,
    content,
    deleteContent,
    updateContent,
    populateContentForm
  };
};

export default useContentManager;
