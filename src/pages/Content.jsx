import React, { useCallback, useEffect, useRef, useState } from "react";

import PropTypes from "prop-types";

import { axiosPrivate } from "~/_api";
import Loading from "~/components/Loading";
import EnhancedTable from "~/components/table/EnhancedTable";
import config from "~/constants/endpoints.json";

const currentConfig = import.meta.env.MODE === "development" ? config.test : config.prod;

const COLUMNS = [
  {
    Header: "Id",
    accessor: "id"
  },
  {
    Header: "Type",
    accessor: "type"
  },
  {
    Header: "Title",
    accessor: "title"
  },
  {
    Header: "Background Image",
    accessor: "background_image"
  },
  {
    Header: "Context Text",
    accessor: "context_text"
  },
  {
    Header: "Description",
    accessor: "description"
  },
  {
    Header: "Header Image",
    accessor: "header_img"
  },
  {
    Header: "Media Link",
    accessor: "media_link"
  },
  {
    Header: "Content Category",
    accessor: "content_category"
  },

  {
    Header: "Lang",
    accessor: "lang"
  },

  {
    Header: "Is Original",
    accessor: "is_original"
  },
  {
    Header: "Auto Translate",
    accessor: "auto_translate"
  },
  {
    Header: "Is Draft",
    accessor: "is_draft"
  },
  {
    Header: "Updated By",
    accessor: "updated_by"
  },
  {
    Header: "Created At",
    accessor: "created_at",
    type: "date"
  },
  {
    Header: "Updated At",
    accessor: "updated_at",
    type: "date"
  },
  {
    Header: "Action",
    accessor: "action"
  }
];
const tableInitialState = {
  pageIndex: 0,
  pageSize: 10
};

const Content = ({ deleteContent, populateContentForm }) => {
  const [data, setData] = React.useState([]);

  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState();
  const callFirstTimeOnly = useRef(false);

  const fetchData = useCallback((start, limit) => {
    axiosPrivate
      .get(`/api/protected/${currentConfig.contents}`, {
        params: {
          start,
          limit
        }
      })
      .then(({ data }) => {
        setData(data.data);
        setTotalRows(data.totalRows);
        setLoading(false);
      })
      .catch((err) => {
        console.error("error :>> ", err);
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    if (!callFirstTimeOnly.current) {
      callFirstTimeOnly.current = true;
      fetchData(0, 10);
    }
  }, [fetchData]);

  if (loading) {
    return <Loading />;
  }

  const updateMyData = (rowIndex, columnId, value) => {
    // We also turn on the flag to not reset the page

    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value
          };
        }
        return row;
      })
    );
  };

  return (
    <div>
      <EnhancedTable
        columns={COLUMNS}
        data={data}
        fetchData={fetchData}
        setData={setData}
        updateMyData={updateMyData}
        deleteAction={deleteContent}
        shouldVisibleToolbar={true}
        populateForm={populateContentForm}
        totalRows={totalRows}
        tableInitialState={tableInitialState}
      />
    </div>
  );
};
Content.propTypes = {
  deleteContent: PropTypes.func,
  populateContentForm: PropTypes.func
};

export default Content;
